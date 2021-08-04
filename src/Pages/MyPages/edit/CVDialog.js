import React from "react";
import {useSlate} from "slate-react";
import xre from "xregexp";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import {Transforms} from "slate";

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

export default CVDialog;
