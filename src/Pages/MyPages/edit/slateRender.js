import React from "react";

const renderElement = (attributes, children, element) => {
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
};

const renderLeaf = (attributes, children, leaf) => {
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
};

export { renderElement, renderLeaf };
