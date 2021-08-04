import Grid from '@material-ui/core/Grid';
import Button from "@material-ui/core/Button";
import {Editor, Element as SlateElement, Transforms} from "slate";
import {useSlate} from "slate-react";
import CVDialog from "./CVDialog";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import styles from "../../../global_styles";

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

const EditorToolbar = withStyles(styles)((props) => {
    // const {classes} = props;
    return <Grid container>
        <Grid container justify="flex-start" xs={12} md={4}>
            <BlockButton format="blockTag/p"/>
            <BlockButton format="blockTag/q"/>
            <BlockButton format="blockTag/q2"/>
        </Grid>
        <Grid container justify="center" xs={12} md={4}>
            <CVDialog cOrV="chapter"/>
            <CVDialog cOrV="verses"/>
        </Grid>
        <Grid container justify="flex-end" xs={12} md={4}>
            <NestedButton format="nd"/>
            <NestedButton format="add"/>
        </Grid>
    </Grid>;
});

export default EditorToolbar;
