import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import styles from "../../../global_styles";

import xre from 'xregexp';

const Drafts = withStyles(styles)((props) => {
    const {classes} = props;
    const [result, setResult] = React.useState({});
    const [newOpen, setNewOpen] = React.useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
    const [menuSelectedIndex, setMenuSelectedIndex] = React.useState(0);
    const [org, setOrg] = React.useState('');
    const [lang, setLang] = React.useState('');
    const [abbr, setAbbr] = React.useState('');
    const [desc, setDesc] = React.useState('');
    const [issues, setIssues] = React.useState([]);
    const [selectedDraft, setSelectedDraft] = React.useState('');
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
    const handleClickOpen = () => {
        setNewOpen(true);
    };

    const handleClose = () => {
        setNewOpen(false);
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
                const fieldRegexes = result.data.selectors.filter(s => s.name === textField);
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
            setNewOpen(false);
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

    const menuDetails = [
        ['', 'Document Range', []],
        [
            'MRK',
            "Mark's Gospel Only (1 Document)",
            ['MRK']
        ],
        [
            'GOSPELS',
            "The Gospels (4 Documents)",
            ['MAT', 'MRK', 'LUK', 'JHN']
        ],
        [
            'NT',
            "The New Testament (27 Documents)",
            [
                "MAT",
                "MRK",
                "LUK",
                "JHN",
                "ACT",
                "ROM",
                "1CO",
                "2CO",
                "GAL",
                "EPH",
                "PHP",
                "COL",
                "1TH",
                "2TH",
                "1TI",
                "2TI",
                "TIT",
                "PHM",
                "HEB",
                "JAS",
                "1PE",
                "2PE",
                "1JN",
                "2JN",
                "3JN",
                "JUD",
                "REV",
            ]
        ],
        [
            'OT',
            "The Hebrew Old Testament (39 Documents)",
            [
                "GEN",
                "EXO",
                "LEV",
                "NUM",
                "DEU",
                "JOS",
                "JDG",
                "RUT",
                "1SA",
                "2SA",
                "1KI",
                "2KI",
                "1CH",
                "2CH",
                "EZR",
                "NEH",
                "EST",
                "JOB",
                "PSA",
                "PRO",
                "ECC",
                "SNG",
                "ISA",
                "JER",
                "LAM",
                "EZK",
                "DAN",
                "HOS",
                "JOL",
                "AMO",
                "OBA",
                "JON",
                "MIC",
                "NAM",
                "HAB",
                "ZEP",
                "HAG",
                "ZEC",
                "MAL",
            ]
        ],
        [
            'BIBLE',
            "A Protestant Bible (66 Documents)",
            [
                "GEN",
                "EXO",
                "LEV",
                "NUM",
                "DEU",
                "JOS",
                "JDG",
                "RUT",
                "1SA",
                "2SA",
                "1KI",
                "2KI",
                "1CH",
                "2CH",
                "EZR",
                "NEH",
                "EST",
                "JOB",
                "PSA",
                "PRO",
                "ECC",
                "SNG",
                "ISA",
                "JER",
                "LAM",
                "EZK",
                "DAN",
                "HOS",
                "JOL",
                "AMO",
                "OBA",
                "JON",
                "MIC",
                "NAM",
                "HAB",
                "ZEP",
                "HAG",
                "ZEC",
                "MAL",
                "MAT",
                "MRK",
                "LUK",
                "JHN",
                "ACT",
                "ROM",
                "1CO",
                "2CO",
                "GAL",
                "EPH",
                "PHP",
                "COL",
                "1TH",
                "2TH",
                "1TI",
                "2TI",
                "TIT",
                "PHM",
                "HEB",
                "JAS",
                "1PE",
                "2PE",
                "1JN",
                "2JN",
                "3JN",
                "JUD",
                "REV",
            ]
        ],
    ];

    const menuOptions = menuDetails.map(d => d[1]);

    const handleClickListItem = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (event, index) => {
        setMenuSelectedIndex(index);
        setMenuAnchorEl(null);
    };
    const draftsQuery = '{\n' +
        'selectors { name regex }\n' +
        '  docSets {\n' +
        '    id\n' +
        '    documents { id\n' +
        '        mainSequence { id }\n' +
        '        bookCode: header(id:"bookCode")\n' +
        '        name: header(id:"toc2")' +
        '    }\n' +
        '  }\n' +
        '}\n';
    React.useEffect(() => {
        const doQuery = async () => {
            return await props.pk.gqlQuery(draftsQuery);
        };
        doQuery().then((res) => {
            if (res.errors) {
                console.log(res.errors);
            }
            setResult(res);
        });
    }, [props.pk, props.app.nMutations]);
    return (
        !result.data ? (
            <h2>
                Loading...
            </h2>
        ) : (<>
                <div style={{paddingTop: "100px"}}>
                    <List>
                        {result.data && result.data.docSets.map((ds, index) => (
                            <ListItem
                                key={index}
                                button
                                dense
                                onClick={() => selectedDraft === ds.id ? setSelectedDraft('') : setSelectedDraft(ds.id)}>
                                <ListItemText primary={ds.id} secondary={selectedDraft === ds.id ? <List>
                                    {ds.documents.map(d => <ListItem
                                        key={d.id}
                                        onClick={
                                            e => {
                                                e.stopPropagation();
                                                props.edit.setDocSetId(ds.id);
                                                props.edit.setDocumentId(d.id);
                                                props.edit.setBookCode(d.bookCode);
                                                props.edit.setSequenceId(d.mainSequence.id);
                                                props.app.setUrl('edit');
                                            }
                                        }>
                                        {d.bookCode}
                                    </ListItem>)}
                                </List> : ''}/>
                            </ListItem>
                        ))}
                    </List>
                    <Button variant="outlined" color="primary" onClick={handleClickOpen}
                            className={classes.newDocSetButton}>
                        New DocSet
                    </Button>
                    <Dialog open={newOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
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
                    </Dialog>
                </div>
            </>
        )
    )
});

export default Drafts;
