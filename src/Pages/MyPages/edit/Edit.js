import React from 'react';
import Typography from "@material-ui/core/Typography";
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from "@material-ui/core/TextField";
import {createEditor, Editor, Element as SlateElement, Transforms} from 'slate';
import {Editable, Slate, useSlate, withReact} from 'slate-react';
import xre from 'xregexp';
import aghastModel from "proskomma-render-aghast";
import DialogContentText from "@material-ui/core/DialogContentText";

const Edit = (props) => {
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
    const renderElement = React.useCallback(({attributes, children, element}) => {
        const voidStyle = {
            userSelect: "none",
            backgroundColor: "#EEE",
            paddingLeft: '0.25em',
            paddingRight: '0.25em',
            marginRight: '0.25em',
        }
        const blockGraftStyle = {
            textAlign: "center",
            color: "#FFF",
            backgroundColor: "#999",
            paddingTop: "5px",
            paddingBottom: "5px",
        }
        const markupStyle = {
            fontSize: "x-small",
        }
        const editorParaStyle = {
            paddingTop: "5px",
        }
        switch (element.type) {
            case 'blockGraft':
                return <div {...attributes} style={editorParaStyle}>
                    <div contentEditable={false} style={{...voidStyle, ...blockGraftStyle}}>{children}</div>
                </div>;
            case 'block':
                const blockStyles = {
                    "blockTag/p": {},
                    "blockTag/q": {marginLeft: "1.5em"},
                    "blockTag/q2": {marginLeft: "3em"},
                }
                return <div {...attributes} style={editorParaStyle}>
                    <span contentEditable={false}
                          style={{...voidStyle, ...markupStyle, ...blockStyles[element.scope]}}>{element.scope.split('/')[1]}</span>
                    {children}
                </div>;
            case 'mark':
                return <span {...attributes}>
                    <span contentEditable={false} style={{...voidStyle, ...markupStyle}}>{children}</span>
                </span>;
            default:
                return <span {...attributes}>{children}</span>;
        }
    })

    const renderLeaf = React.useCallback(({attributes, children, leaf}) => {
        return <span
            {...attributes}
            style={{
                fontWeight: leaf.nd ? 'bold' : 'normal',
                fontStyle: leaf.add ? 'italic' : 'normal',
                textTransform: leaf.nd ? 'uppercase' : 'none',
            }}
        >
            {children}
        </span>
    });

    const isBlockActive = (editor, format) => {
        const [match] = Editor.nodes(editor, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
        });
        return !!match;
    }

    const toggleBlock = (editor, format) => {
        const isActive = isBlockActive(editor, format);
        const newProperties = {
            scope: isActive ? 'blockTag/p' : format,
        }
        Transforms.setNodes(editor, newProperties);
    }

    const BlockButton = ({format}) => {
        const editor = useSlate();
        return <Button
            variant="outlined"
            size="small"
            onClick={event => {
                event.preventDefault();
                toggleBlock(editor, format);
            }}
        >
            {format.split('/')[1]}
        </Button>;
    };

    const addCV = (editor, cOrV, n, location) => {
        const newNode = {
            type: "mark",
            scope: `${cOrV}/${n}`,
            children: [
                {text: `${cOrV[0]} ${n}`}
            ]
        };
        Transforms.insertNodes(
            editor,
            newNode,
            {at: location},
        )
    }

    const CVDialog = ({cOrV}) => {
        const [editorSelection, setEditorSelection] = React.useState(null);
        const [issues, setIssues] = React.useState([]);
        const [open, setOpen] = React.useState(false);
        const [n, setN] = React.useState('');
        const editor = useSlate();
        const handleClose = () => {
            setOpen(false);
        };
        const handleSubmit = () => {
            const newIssues = [];
            if (!xre.test(n, xre("^\\d+(-\\d+)?$"))) {
                newIssues.push("Not a valid verse or verse range");
            }
            if (newIssues.length === 0) {
                addCV(editor, cOrV, n, editorSelection);
                setOpen(false);
            }
            setIssues(newIssues);
        };
        return <>
            <Button
                variant="outlined"
                size="small"
                onClick={
                    () => {
                        setEditorSelection(editor.selection);
                        setOpen(true);
                    }
                }
            >
                {cOrV}
            </Button>
            <Dialog onClose={handleClose} aria-labelledby="cv-dialog-title" open={open}>
                <DialogTitle id="cv-dialog-title">{`${cOrV}}`}</DialogTitle>
                <DialogContent>
                    {
                        issues.length > 0 &&
                        <DialogContentText style={{color: 'red'}}>{issues.join('; ')}</DialogContentText>
                    }
                    <TextField
                        autoFocus
                        margin="dense"
                        id="n"
                        label="Number/Range"
                        type="text"
                        onChange={e => setN(e.target.value)}
                        value={n}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    };

    const isMarkActive = (editor, format) => {
        const marks = Editor.marks(editor);
        return marks ? marks[format] === true : false;
    }

    const toggleMark = (editor, format) => {
        const isActive = isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    }

    const NestedButton = ({format}) => {
        const editor = useSlate();
        return <Button
            variant="outlined"
            size="small"
            onClick={event => {
                event.preventDefault();
                toggleMark(editor, format);
            }}
        >
            {format}
        </Button>;
    };

    const EditorToolbar = () => {
        return <div>
            <span style={{paddingRight: "3em"}}>
                <BlockButton format="blockTag/p"/>
                <BlockButton format="blockTag/q"/>
                <BlockButton format="blockTag/q2"/>
            </span>
            <span style={{paddingRight: "3em"}}>
                <CVDialog cOrV="chapter"/>
                <CVDialog cOrV="verses"/>
            </span>
            <span>
                <NestedButton format="nd"/>
                <NestedButton format="add"/>
            </span>
        </div>;
    }

    return (
        !result.data ? (
            <h2 style={{paddingTop: "100px"}}>
                Loading...
            </h2>
        ) : (
            <div style={{paddingTop: "100px"}}>
                <Typography variant="h5">{props.edit.bookCode}</Typography>
                {
                    Object.keys(aghast).length > 0 &&
                    <Slate
                        editor={slateEditor}
                        value={aghast}
                        onChange={newValue => {
                            setAghast(newValue);
                        }}
                    >
                        <EditorToolbar/>
                        <Editable
                            renderElement={renderElement}
                            renderLeaf={renderLeaf}
                        />
                    </Slate>
                }
                <hr/>
                <pre
                    style={{fontSize: "xx-small"}}>{Object.keys(aghast).length > 0 && JSON.stringify(aghast[0].children, null, 2)}</pre>
            </div>
        )
    )
};

export default Edit;
