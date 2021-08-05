import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import React from "react";
import xre from "xregexp";

import { menuOptions, menuDetails } from "./menuDetails";

const NewDocSetDialog = (props) => {
    const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
    const [menuSelectedIndex, setMenuSelectedIndex] = React.useState(0);
    const [issues, setIssues] = React.useState([]);
    const [org, setOrg] = React.useState('');
    const [lang, setLang] = React.useState('');
    const [abbr, setAbbr] = React.useState('');
    const [desc, setDesc] = React.useState('');

    const textFieldAccessors = {
        org,
        lang,
        abbr,
        desc,
    };
    const textFieldModifiers = {
        'org': setOrg,
        'lang': setLang,
        'abbr': setAbbr,
        'desc': setDesc,
    };

    const handleClickListItem = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (event, index) => {
        setMenuSelectedIndex(index);
        setMenuAnchorEl(null);
    };

    const handleClose = () => {
        props.setNewOpen(false);
    };

    const textFieldChange = (e, field) => {
        textFieldModifiers[field](e.target.value);
    };

    const handleSubmit = () => {
        const newIssues = [];
        for (const [textField, textAccessor] of Object.entries(textFieldAccessors)) {
            if (textAccessor.trim() === '') {
                newIssues.push(`No value for ${textField}`);
            } else {
                const fieldRegexes = props.result.data.selectors.filter(s => s.name === textField);
                if (fieldRegexes.length === 1) {
                    const fieldRegex = fieldRegexes[0].regex;
                    if (!xre.test(textAccessor.trim(), xre(fieldRegex))) {
                        newIssues.push(`value for ${textField} does not match expected pattern '${fieldRegex}'`);
                    }
                }
            }
        }
        if (menuSelectedIndex === 0) {
            newIssues.push(`No document range selected`);
        }
        if (newIssues.length === 0) {
            props.setNewOpen(false);
            newDraft();
        }
        setIssues(newIssues);
    };

    const newDraft = () => {
        const canon = menuDetails[menuSelectedIndex][2];
        const documents = []
        for (const bookCode of canon) {
            documents.push(`\\id ${bookCode} ${textFieldAccessors['desc']}\n` +
                ['toc1', 'toc2', 'toc3', 'h'].map(n => `\\${n} ${bookCode}`).join('\n') + '\n' +
                `\\mt ${bookCode}\n` +
                `\\c 1\n\\p\n\\v 1\nSTART HERE`);
        }
        props.pk.importDocuments(
            {
                org: textFieldAccessors['org'],
                lang: textFieldAccessors['lang'],
                abbr: textFieldAccessors['abbr'],
            },
            'usfm',
            documents,
            {}
        );
        props.pk.docSets[`${textFieldAccessors['org']}/${textFieldAccessors['lang']}_${textFieldAccessors['abbr']}`].addTag('draft');
        props.app.setNMutations(props.app.nMutations + 1);
    }

    return <Dialog open={props.newOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New DocSet</DialogTitle>
        <DialogContent>
            {issues.length > 0 ?
                <DialogContentText style={{color: 'red'}}>{issues.join('; ')}</DialogContentText> :
                <DialogContentText>
                    This form will create a new docSet with a number of empty documents.
                </DialogContentText>}
            <TextField
                autoFocus
                margin="dense"
                id="org"
                label="Organization"
                type="text"
                onChange={e => textFieldChange(e, 'org')}
                value={org}
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                id="lang"
                label="Language Code"
                type="text"
                onChange={e => textFieldChange(e, 'lang')}
                value={lang}
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                id="abbr"
                label="Abbreviation"
                type="text"
                onChange={e => textFieldChange(e, 'abbr')}
                value={abbr}
                fullWidth
            />
            <TextField
                autoFocus
                margin="dense"
                id="desc"
                label="Description"
                type="text"
                onChange={e => textFieldChange(e, 'desc')}
                value={desc}
                fullWidth
            />
            <List component="nav" aria-label="Device settings">
                <ListItem
                    button
                    aria-haspopup="true"
                    aria-controls="lock-menu"
                    aria-label="when device is locked"
                    onClick={handleClickListItem}
                >
                    <ListItemText primary="Range of Documents to Create"
                                  secondary={menuOptions[menuSelectedIndex]}/>
                </ListItem>
            </List>
            <Menu
                id="lock-menu"
                anchorEl={menuAnchorEl}
                keepMounted
                open={Boolean(menuAnchorEl)}
                onClose={handleClose}
            >
                {menuOptions.map((option, index) => (
                    <MenuItem
                        key={option}
                        disabled={index === 0}
                        selected={index === menuSelectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} color="secondary">
                Cancel
            </Button>
            <Button onClick={handleSubmit} color="primary">
                Create
            </Button>
        </DialogActions>
    </Dialog>;
}

export default NewDocSetDialog;
