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
    const editQueryTemplate = '{' +
        '  docSets(withTags:["draft"] ids:"%docSetId%") {' +
        '    id' +
        '    selectors { key value }' +
        '    tags' +
        '    documents {' +
        '      id' +
        '      headers { key value }' +
        '      idParts { type parts }' +
        '      tags' +
        '      mainId' +
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
            return await props.pk.gqlQuery(editQuery);
        };
        doQuery().then((res) => {
            if (res.errors) {
                console.log(res.errors);
            }
            setResult(res);
            if (res.data) {
                const config = {};
                const model = aghastModel(res.data, config);
                model.render();
                setAghast([config.aghast]);
            }
        });
    }, [props.pk, props.edit]);

    const slateEditor = React.useMemo(() => withReact(createEditor()), []);
    slateEditor.isInline = (element) => ['mark', 'tokens'].includes(element.type);
    slateEditor.isVoid = (element) => element === 'mark';
    const renderLeafCallback = React.useCallback(({attributes, children, leaf}) => {
        return renderLeaf(attributes, children, leaf);
    });
    const renderElementCallback = React.useCallback(({attributes, children, element}) => {
        return renderElement(attributes, children, element);
    });
    const idParts = result.data && result.data.docSets[0].documents.filter(d => d.id = props.edit.documentId)[0].idParts.parts;
    return (
        <>
            <div className={classes.toolbarMargin}/>
            {!result.data ? (
                <Typography variant="h2" className={classes.loading}>
                    Loading...
                </Typography>
            ) : (
                <Container className={classes.page}>
                    <Grid xs={12}>
                        <Typography variant="h5">{`${idParts[0]} - ${idParts[1]} (${props.edit.docSetId})`}</Typography>
                    </Grid>
                    {
                        Object.keys(aghast).length > 0 &&
                        <Grid xs={12}>
                            <Slate
                                editor={slateEditor}
                                value={aghast}
                                onChange={newValue => {
                                    setAghast(newValue);
                                }}
                            >
                                <EditorToolbar/>
                                <Editable
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
