import xre from 'xregexp';
import { lexingRegexes } from 'proskomma';

const mainRegex = xre.union(lexingRegexes.map((x) => x[2]));
const tokenTypes = {};
for (const lr of lexingRegexes) {
    if (['eol', 'lineSpace', 'punctuation', 'wordLike'].includes(lr[1])) {
        tokenTypes[lr[1]] = lr[2];
    }
}

const saveAghast = (rawAghast, setToWrite) => {

    let blocks = [];
    let waitingBlockGrafts = [];
    let currentChapter = null;
    let currentVerses = null;
    let includedScopes;
    const openScopes = new Set([]);
    let openSpans = [];

    const removeEmptyText = a => {
        return a.map(b => ({...b, children: b.children.filter(c => c.type || (c.text && c.text !== ''))}));
    }

    const removeEmptyBlocks = a => {
        return a.filter(b => b.type === 'blockGraft' || b.children.length > 0);
    }

    const tokenizeString = str => {
        const ret = [];
        for (const token of xre.match(str, mainRegex, 'all')) {
            let tokenType;
            if (xre.test(token, tokenTypes['wordLike'])) {
                tokenType = 'wordLike';
            } else if (xre.test(token, tokenTypes['punctuation'])) {
                tokenType = 'punctuation';
            } else if (xre.test(token, tokenTypes['lineSpace']))  {
                tokenType = 'lineSpace';
            } else if (xre.test(token, tokenTypes['eol']))  {
                tokenType = 'eol';
            } else {
                tokenType = 'unknown';
            }
            ret.push([token, tokenType]);
        }
        return ret;
    }

    const endChapter = (ret, cn) => {
        ret.push({
            type: 'scope',
            subType: 'end',
            payload: `chapter/${cn}`,
        });
        openScopes.delete(`chapter/${cn}`);
    }

    const startChapter = (ret, cn) => {
        ret.push({
            type: 'scope',
            subType: 'start',
            payload: `chapter/${cn}`,
        });
        openScopes.add(`chapter/${cn}`);
        includedScopes.add(`chapter/${cn}`);
    }

    const endVerses = (ret, v) => {
        ret.push({
            type: 'scope',
            subType: 'end',
            payload: `verses/${v}`,
        });
        openScopes.delete(`verses/${v}`);
        if (v.includes('-')) {
            let [fromVerse, toVerse] = v
                .split('-')
                .map(v => parseInt(v))
            while (toVerse >= fromVerse) {
                ret.push({
                    type: 'scope',
                    subType: 'end',
                    payload: `verse/${toVerse}`,
                })
                toVerse--;
            };
            openScopes.delete(`verse/${toVerse}`);
        } else {
            ret.push({
                type: 'scope',
                subType: 'end',
                payload: `verse/${v}`,
            });
            openScopes.delete(`verse/${v}`);
        }
    }

    const startVerses = (ret, v) => {
        if (v.includes('-')) {
            let [fromVerse, toVerse] = v.split('-').map(v => parseInt(v));
            while (fromVerse <= toVerse) {
                ret.push({
                    type: 'scope',
                    subType: 'start',
                    payload: `verse/${fromVerse}`,
                });
                openScopes.add(`verse/${fromVerse}`);
                includedScopes.add(`verse/${fromVerse}`);
                fromVerse++;
            }
        } else {
            ret.push({
                type: 'scope',
                subType: 'start',
                payload: `verse/${v}`,
            });
            openScopes.add(`verse/${v}`);
            includedScopes.add(`verse/${v}`);
        }
        ret.push({
            type: 'scope',
            subType: 'start',
            payload: `verses/${v}`,
        });
        openScopes.add(`verses/${v}`);
        includedScopes.add(`verses/${v}`);
    }

    const processItems = items => {
        const ret = [];
        for (const item of items) {
            if (!item.type && item.text) {
                const textStyles = Object.keys(item).filter(k => k !== 'text');
                while (openSpans.filter(s => !(textStyles.includes(s))).length > 0) {
                    ret.push({
                        type: 'scope',
                        subType: 'end',
                        payload: `span/${openSpans[0]}`,
                    })
                    openScopes.delete(`span/${openSpans[0]}`);
                    openSpans.shift();
                }
                for (const newStyle of textStyles.filter(t => !(openSpans.includes(t)))) {
                    ret.push({
                        type: 'scope',
                        subType: 'start',
                        payload: `span/${newStyle}`,
                    });
                    openScopes.add(`span/${newStyle}`);
                    includedScopes.add(`span/${newStyle}`);
                    openSpans.unshift(newStyle);
                }
                const tokenized = tokenizeString(item.text);
                for (const [tokenText, tokenType] of tokenized) {
                    ret.push({
                        type: 'token',
                        subType: tokenType,
                        payload: tokenText,
                    })
                }
            } else if (item.type === 'mark') {
                const markType = item.scope.split('/')[0];
                if (markType === 'chapter') {
                    if (currentChapter) {
                        if (currentVerses) {
                            endVerses(ret, currentVerses);
                            currentVerses = null;
                        }
                        endChapter(ret, currentChapter);
                    }
                    currentChapter = item.scope.split('/')[1];
                    startChapter(ret, currentChapter);
                } else if (markType === 'verses') {
                    if (currentVerses) {
                        endVerses(ret, currentVerses);
                    }
                    currentVerses = item.scope.split('/')[1];
                    startVerses(ret, currentVerses);
                }
            }
        }
        for (const openScope of openSpans) {
            ret.push({
                type: 'scope',
                subType: 'end',
                payload: `span/${openScope}`,
            })
            openScopes.delete(`span/${openScope}`);
        }
        return ret;
    };

    let aghastSequenceChildren = removeEmptyBlocks(removeEmptyText(rawAghast[0].children));
    for (const blockLike of aghastSequenceChildren) {
        if (blockLike.type === 'blockGraft') {
            waitingBlockGrafts.push({
                type: 'graft',
                subType: blockLike.subType,
                payload: blockLike.seqId,
            });
        } else {
            const string2scope = str => ({
               type: 'scope',
               subType: 'start',
               payload: str,
            });
            includedScopes = new Set([]);
            const oss = Array.from(openScopes)
            const items = processItems(blockLike.children);
            blocks.push({
                os: oss.map(string2scope),
                is: Array.from(includedScopes).map(string2scope),
                bs: {
                    type: 'scope',
                    subType: 'start',
                    payload: blockLike.scope,
                },
                bg: waitingBlockGrafts,
                items: items,
            });
            waitingBlockGrafts = [];
        }
    }
    if (currentVerses) {
        endVerses(blocks[blocks.length -1].items, currentVerses);
    }
    if (currentChapter) {
        endChapter(blocks[blocks.length -1].items, currentChapter);
    }
    // console.log(JSON.stringify(blocks, null, 2));
    setToWrite(blocks);
}

export default saveAghast;
