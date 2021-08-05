import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import {withStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {createEditor} from 'slate';
import {Editable, Slate, withReact} from 'slate-react';
import aghastModel from "proskomma-render-aghast";
import EditorToolbar from "./EditorToolbox";
import {renderElement, renderLeaf} from "./slateRender";
import styles from '../../../global_styles';

const Edit = withStyles(styles)((props) => {
    const {classes} = props;
    const [result, setResult] = React.useState({});
    const [aghast, setAghast] = React.useState({});
    const [sequences, setSequences] = React.useState([]);
    const editQueryTemplate = '{' +
        '  docSets(ids:"%docSetId%") {' +
        '    id' +
        '    selectors { key value }' +
        '    isDraft: hasTag(tagName:"draft")' +
        '    tags' +
        '    documents(ids:"%documentId%") {' +
        '      id' +
        '      headers { key value }' +
        '      idParts { type parts }' +
        '      tags' +
        '      mainSequence { id }' +
        '      sequences {' +
        '        id' +
        '        type' +
        //        '        tags' +
        '        blocks {' +
        '          bs { payload }' +
        '          bg { subType payload }' +
        '          items { type subType payload }' +
        '        }' +
        '      }' +
        '    }' +
        '  }' +
        '}';
    React.useEffect(() => {
        const doQuery = async () => {
            const editQuery = editQueryTemplate
                .replace(/%docSetId%/g, props.edit.docSetId)
                .replace(/%documentId%/g, props.edit.documentId)
            return await props.pk.gqlQuery(editQuery);
        };
        doQuery().then((res) => {
            if (res.errors) {
                console.log(res.errors);
            }
            setResult(res);
            if (res.data) {
                const document = res.data.docSets[0].documents.filter(d => d.id === props.edit.documentId)[0];
                const newSequences = [];
                const nextSequence = {};
                for (const sequence of document.sequences) {
                    if (sequence.type in nextSequence) {
                        nextSequence[sequence.type]++;
                    } else {
                        nextSequence[sequence.type] = 1;
                    }
                    newSequences.push([`${sequence.type} ${nextSequence[sequence.type]}`, `${sequence.id}`]);
                }
                setSequences(newSequences);
                const config = {sequenceId: props.edit.sequenceId};
                const model = aghastModel(res.data, config);
                model.render({
                    actions: {},
                    docSet: props.edit.docSetId,
                    document: props.edit.documentId,
                }
        );
                if (config.aghast.children.length > 0) {
                    setAghast([config.aghast]);
                }
            }
        });
    }, [props.pk, props.edit.docSetId, props.edit.documentId, props.edit.bookCode, props.edit.sequenceId]);

    const slateEditor = React.useMemo(() => withReact(createEditor()), []);
    slateEditor.isInline = (element) => ['mark', 'tokens'].includes(element.type);
    slateEditor.isVoid = (element) => element === 'mark';
    const renderLeafCallback = React.useCallback(({attributes, children, leaf}) => {
        return renderLeaf(attributes, children, leaf);
    });
    const renderElementCallback = React.useCallback(({attributes, children, element}) => {
        return renderElement(attributes, children, element);
    });
    const idParts = result.data && result.data.docSets[0].documents.filter(d => d.id === props.edit.documentId)[0].idParts.parts;
    return (
        <>
            <div className={classes.toolbarMargin}/>
            {!result.data ? (
                <Typography variant="h2" className={classes.loading}>
                    Loading...
                </Typography>
            ) : (
                <Container className={classes.page}>
                    <Grid item xs={12}>
                        <Typography variant="h5">{`${idParts[0]} - ${idParts[1]} (${props.edit.docSetId})`}</Typography>
                    </Grid>
                    {
                        Object.keys(aghast).length > 0 &&
                        <Grid item xs={12}>
                            <Slate
                                editor={slateEditor}
                                value={aghast}
                                onChange={newValue => {
                                    setAghast(newValue);
                                }}
                            >
                                <EditorToolbar
                                    sequences={sequences}
                                    selectedSequence={props.edit.sequenceId}
                                    setSelectedSequence={props.edit.setSequenceId}
                                />
                                <Editable
                                    readOnly={!result.data.docSets[0].isDraft}
                                    renderElement={renderElementCallback}
                                    renderLeaf={renderLeafCallback}
                                />
                            </Slate>
                        </Grid>
                    }
                    <hr/>
                    <pre
                        style={{fontSize: "xx-small"}}>
                        {Object.keys(aghast).length > 0 && JSON.stringify(aghast[0].children, null, 2)}
                    </pre>
                </Container>
            )
            }
        </>
    )
});

export default Edit;
