import xre from 'xregexp';
import { lexingRegexes } from 'proskomma';

const mainRegex = xre.union(lexingRegexes.map((x) => x[2]));
const tokenTypes = {};
for (const lr of lexingRegexes) {
    if (['eol', 'lineSpace', 'punctuation', 'wordLike'].includes(lr[1])) {
        tokenTypes[lr[1]] = lr[2];
    }
}

const saveAghast = rawAghast => {

    let blocks = [];
    let waitingBlockGrafts = [];
    let currentChapter = null;
    let currentVerses = null;
    let openScopes = [];

    const removeEmptyText = a => {
        return a.map(b => ({...b, children: b.children.filter(c => c.type || (c.text && c.text !== ''))}));
    }

    const tokenizeString = str => {
        const ret = [];
        for (const token of xre.match(str, mainRegex, 'all')) {
            let tokenType;
            if (xre.test(token, tokenTypes['wordLike'])) {
                tokenType = 'wordLike';
            } else if (xre.test(token, tokenTypes['punctuation'])) {
                tokenType = 'punctuation';
            } else if (xre.test(token, tokenTypes['lineSpace']) || xre.test(token, tokenTypes['eol'])) {
                tokenType = 'lineSpace';
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
        })
    }

    const startChapter = (ret, cn) => {
        ret.push({
            type: 'scope',
            subType: 'start',
            payload: `chapter/${cn}`,
        })
    }

    const endVerses = (ret, v) => {
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
            }
        } else {
            ret.push({
                type: 'scope',
                subType: 'end',
                payload: `verse/${v}`,
            })
        }
        ret.push({
            type: 'scope',
            subType: 'end',
            payload: `verses/${v}`,
        })
    }

    const startVerses = (ret, v) => {
        ret.push({
            type: 'scope',
            subType: 'start',
            payload: `verses/${v}`,
        })
        if (v.includes('-')) {
            let [fromVerse, toVerse] = v.split('-').map(v => parseInt(v));
            while (fromVerse <= toVerse) {
                ret.push({
                    type: 'scope',
                    subType: 'start',
                    payload: `verse/${fromVerse}`,
                })
                fromVerse++;
            }
        } else {
            ret.push({
                type: 'scope',
                subType: 'start',
                payload: `verse/${v}`,
            })
        }
    }

    const processItems = items => {
        const ret = [];
        for (const item of items) {
            if (!item.type && item.text) {
                const textStyles = Object.keys(item).filter(k => k !== 'text');
                while (openScopes.filter(s => !(textStyles.includes(s))).length > 0) {
                    ret.push({
                        type: 'scope',
                        subType: 'end',
                        payload: `charTag/${openScopes[0]}`,
                    })
                    openScopes.shift();
                }
                for (const newStyle of textStyles.filter(t => !(openScopes.includes(t)))) {
                    ret.push({
                        type: 'scope',
                        subType: 'start',
                        payload: `charTag/${newStyle}`,
                    });
                    openScopes.unshift(newStyle);
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
        for (const openScope of openScopes) {
            ret.push({
                type: 'scope',
                subType: 'end',
                payload: `charTag/${openScope}`,
            })
        }
        if (currentVerses) {
            endVerses(ret, currentVerses);
        }
        if (currentChapter) {
            endChapter(ret, currentChapter);
        }
        return ret;
    };

    let aghastSequenceChildren = removeEmptyText(rawAghast[0].children);
    for (const blockLike of aghastSequenceChildren) {
        if (blockLike.type === 'blockGraft') {
            waitingBlockGrafts.push({
                type: 'graft',
                subType: blockLike.subType,
                payload: blockLike.seqId,
            });
        } else {
            blocks.push({
                bs: blockLike.scope,
                bg: waitingBlockGrafts,
                items: processItems(blockLike.children),
            });
            waitingBlockGrafts = [];
        }
    }
    console.log(JSON.stringify(blocks, null, 2));
}

export default saveAghast;
