import React from 'react';
import Typography from "@material-ui/core/Typography";
import {createEditor} from 'slate';
import {Editable, Slate, withReact} from 'slate-react';
import aghastModel from "proskomma-render-aghast";

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
        switch (element.type) {
            case 'blockGraft':
                return <div {...attributes}>
                    <div contentEditable={false} style={voidStyle}>{children}</div>
                </div>;
            case 'block':
                return <div {...attributes}>
                    <span contentEditable={false} style={voidStyle}>{element.scope.split('/')[1]}</span>
                    {children}
                </div>;
            case 'mark':
                return <span {...attributes}>
                    <span contentEditable={false} style={voidStyle}>{children}</span>
                </span>;
            default:
                return <span {...attributes}>{children}</span>;
        }
    })
    return (
        !result.data ? (
            <h2 style={{paddingTop: "100px"}}>
                Loading...
            </h2>
        ) : (
            <div style={{paddingTop: "100px"}}>
                <Typography variant="h5">{props.edit.bookCode}</Typography>
                {Object.keys(aghast).length > 0 && <Slate
                    editor={slateEditor}
                    value={aghast}
                    onChange={newValue => {
                        console.log(newValue);
                        setAghast(newValue);
                    }}
                 >
                    <Editable renderElement={renderElement} />
                </Slate>}
                <hr/>
                <pre>{JSON.stringify(aghast, null, 2)}</pre>
            </div>
        )
    )
};

export default Edit;
