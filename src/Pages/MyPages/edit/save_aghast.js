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
    const processItems = items => {
        const ret = [];
        for (const item of items) {
            if (!item.type && item.text) {
                const tokenized = tokenizeString(item.text);
                for (const [tokenText, tokenType] of tokenized) {
                    ret.push({
                        type: 'token',
                        subType: tokenType,
                        payload: tokenText,
                    })
                }
            } else if (item.type === 'mark') {
                ret.push({
                    type: 'scope',
                    subType: 'start',
                    payload: item.scope,
                })
            }
        }
        return ret;
    };

    let aghastSequenceChildren = removeEmptyText(rawAghast[0].children);
    let blocks = [];
    let waitingBlockGrafts = [];
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
            })
        }
    }
    console.log(JSON.stringify(blocks, null, 2));
}

export default saveAghast;
