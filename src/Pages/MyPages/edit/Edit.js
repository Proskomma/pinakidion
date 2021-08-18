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
import { SaveButton, ShowAghastButton } from './buttons';

const Edit = withStyles(styles)((props) => {
    const {classes} = props;
    const [result, setResult] = React.useState({});
    const [aghast, setAghast] = React.useState({});
    const [edited, setEdited] = React.useState(false);
    const [sequences, setSequences] = React.useState([]);
    const [showAghast, setShowAghast] = React.useState(false);
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
                    <Grid container justify="center" xs={12}>
                        <Typography variant="h4">{`${idParts[0]} - ${props.edit.docSetId}`}</Typography>
                    </Grid>
                    <Grid container justify="center" xs={12}>
                        <Typography variant="subtitle2">{idParts[1]}</Typography>
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
                                    onKeyDown={event => {
                                        setEdited(true);
                                    }}
                                    style={{
                                        height: '500px',
                                        paddingLeft: "10px",
                                        paddingRight: "10px",
                                        overflowY:'auto',
                                        backgroundColor: "#EEE",
                                    }}
                                />
                            </Slate>
                        </Grid>
                    }
                    <Grid container justify="center" xs={12} style={{paddingTop:"10px", paddingBottom:"10px"}}>
                        <Grid justify="flex-start" xs={6}>
                        <ShowAghastButton showAghast={showAghast} setShowAghast={setShowAghast}/>
                        </Grid>
                        <Grid justify="flex-end" xs={6} style={{textAlign:"right"}}>
                            <SaveButton edited={edited} setEdited={setEdited} aghast={aghast}/>
                        </Grid>
                    </Grid>
                    <Grid justify="center" xs={12}>
                        {showAghast && Object.keys(aghast).length > 0 && <pre
                        style={{fontSize: "xx-small", height: '500px', overflowY:'auto', backgroundColor: "#EEE"}}
                        >
                        {JSON.stringify(aghast[0].children, null, 2)}
                    </pre>}
                    </Grid>
                </Container>
            )
            }
        </>
    )
});

export default Edit;
