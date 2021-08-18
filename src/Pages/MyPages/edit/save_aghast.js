import { lexingRegexes } from 'proskomma';

const saveAghast = rawAghast => {

    const removeEmptyText = a => {
        return a.map(b => ({...b, children: b.children.filter(c => c.type || (c.text && c.text !== ''))}));
    }

    const processItems = items => {
        const ret = [];
        for (const item of items) {
            if (!item.type && item.text) {
                for (const [tokenText, tokenType] of [[item.text, 'wordLike']]) {
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
