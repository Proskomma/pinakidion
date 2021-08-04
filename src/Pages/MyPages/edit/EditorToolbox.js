import {Editor, Element as SlateElement, Transforms} from "slate";
import {useSlate} from "slate-react";
import Button from "@material-ui/core/Button";
import CVDialog from "./CVDialog";
import React from "react";

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

export default EditorToolbar;
