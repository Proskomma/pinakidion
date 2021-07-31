import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import DocSetPicker from "../../../sharedComponents/DocSetPicker";
import InspectQuery from "../../../sharedComponents/InspectQuery";
import styles from '../../../global_styles';
import Container from "@material-ui/core/Container";

const exactSearchQueryTemplate =
    '{' +
    '  docSet(id:"%docSetId%") {\n' +
    '    documents(' +
    '        withChars: [%searchTerms%]\n' +
    '        allChars:%allChars%\n' +
    '      ) {\n' +
    '       id\n' +
    '       bookCode: header(id: "bookCode")\n' +
    '       title: header(id: "toc2")\n' +
    '       mainSequence {\n' +
    '         blocks(\n' +
    '           withChars: [%searchTerms%]\n' +
    '           allChars:%allChars%\n' +
    '         ) {\n' +
    '           scopeLabels tokens { payload }\n' +
    '         }\n' +
    '       }\n' +
    '    }\n' +
    '    matches: enumRegexIndexesForString (enumType:"wordLike" searchRegex:"%searchTermsRegex%") { matched }\n' +
    '  }\n' +
    '}';

const regexSearchQueryTemplate =
    '{' +
    '  docSet(id:"%docSetId%") {\n' +
    '    documents(' +
    '        withMatchingChars: [%searchTerms%]\n' +
    '        allChars:%allChars%\n' +
    '      ) {\n' +
    '       id\n' +
    '       bookCode: header(id: "bookCode")\n' +
    '       title: header(id: "toc2")\n' +
    '       mainSequence {\n' +
    '         blocks(\n' +
    '           withMatchingChars: [%searchTerms%]\n' +
    '           allChars:%allChars%\n' +
    '         ) {\n' +
    '           scopeLabels tokens { payload }\n' +
    '         }\n' +
    '       }\n' +
    '    }\n' +
    '    matches: enumRegexIndexesForString (enumType:"wordLike" searchRegex:"%searchTermsRegex%") { matched }\n' +
    '  }\n' +
    '}';

const Search = withStyles(styles)((props) => {
    const {classes} = props;
    const [selectedDocSet, setSelectedDocSet] = React.useState(null);
    const [result, setResult] = React.useState({});
    const [resultExpired, setResultExpired] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [searchTerms, setSearchTerms] = React.useState('');
    const [searchString, setSearchString] = React.useState('');
    const [allChars, setAllChars] = React.useState(false);
    const [exactMatch, setExactMatch] = React.useState(true);
    const [from, setFrom] = React.useState(0);

    // Build new query when searchTerms change
    React.useEffect(() => {
        if (selectedDocSet) {
            const searchTermsArray = searchTerms.split(/ +/).map((st) => st.trim()).filter(st => st.length > 0);
            if (searchTermsArray.length > 0) {
                if (exactMatch) {
                    setQuery(
                        exactSearchQueryTemplate
                            .replace(/%docSetId%/g, selectedDocSet)
                            .replace(
                                /%searchTerms%/g,
                                searchTermsArray.map((st) => `"${st}"`).join(', ')
                            )
                            .replace(
                                /%searchTermsRegex%/g,
                                searchTermsArray.map((st) => `(^${st}$)`).join('|')
                            )
                            .replace(
                                /%allChars%/g,
                                allChars ? "true" : "false"
                            )
                    );
                } else {
                    setQuery(
                        regexSearchQueryTemplate
                            .replace(/%docSetId%/g, selectedDocSet)
                            .replace(
                                /%searchTerms%/g,
                                searchTermsArray.map((st) => `"${st}"`).join(', ')
                            )
                            .replace(
                                /%searchTermsRegex%/g,
                                searchTermsArray.map((st) => `(${st})`).join('|')
                            )
                            .replace(
                                /%allChars%/g,
                                allChars ? "true" : "false"
                            )
                    );
                }
            };
            setResultExpired(true);
        }
    }, [searchTerms, allChars, exactMatch]);

    // Run query when query or docSet changes
    React.useEffect(() => {
        const doQuery = async () => {
            setFrom(0);
            const res = await props.pk.gqlQuery(query);
            // console.log(`'${searchString}' (${exactMatch ? 'Exact' : 'Regex'}, ${allChars ? 'All' : 'Any'}): ${Date.now() - t} msec`);
            setResult(res);
            setResultExpired(false);
        };
        if (searchTerms.trim().length > 0) {
            doQuery();
        }
    }, [selectedDocSet, query]);

    const handleButtonClick = () => {
        setSearchTerms(searchString);
    };

    const handleInput = (ev) => {
        setSearchString(ev.target.value);
    };

    let matchRecords = [];
    let count = 0;
    if (result && result.data && result.data.docSet) {
        const matchableTerms = new Set(result.data.docSet.matches.map((m) => m.matched));
        for (const matchingDocument of result.data.docSet.documents.filter(
            (d) => d.mainSequence.blocks.length > 0
        )) {
            for (const matchingBlock of matchingDocument.mainSequence.blocks) {
                if (count < from) {
                    count++;
                    continue;
                }
                if (count > (from + 20)) {
                    count++;
                    continue;
                }
                matchRecords.push([
                    matchingDocument.id,
                    matchingDocument.bookCode,
                    matchingDocument.title,
                    matchingBlock.scopeLabels
                        .filter((sl) => sl.startsWith('chapter'))
                        .map((sl) => sl.split('/')[1]),
                    matchingBlock.scopeLabels
                        .filter((sl) => sl.startsWith('verse/'))
                        .map((sl) => sl.split('/')[1])
                        .map((v) => parseInt(v)),
                    [...matchingBlock.tokens.map((t) => t.payload).entries()].map((t) => (
                        <Typography
                            key={t[0]}
                            variant="inherit"
                            display="inline"
                            className={
                                matchableTerms.has(t[1]) ? classes.boldPara : classes.para
                            }
                        >
                            {t[1]}
                        </Typography>
                    )),
                ]);
                count++;
            }
        }
    }

    return (
        <>
            <div className={classes.toolbarMargin}/>
            <Container className={classes.page}>
                <div>
                    <DocSetPicker
                        selectedDocSet={selectedDocSet}
                        setSelectedDocSet={setSelectedDocSet}
                        app={props.app}
                    />
                    {!selectedDocSet && (
                        <Typography variant="h5" display="inline" className={classes.requireInput}>Please Select a DocSet</Typography>
                    )}
                    <InspectQuery app={props.app} raw={props.raw} query={query}/>
                </div>
                {
                    selectedDocSet &&
                    <div>
                        <TextField
                            className={classes.searchTerms}
                            label="Search Terms"
                            value={searchString}
                            onChange={handleInput}
                        />
                    </div>
                }
                {
                    selectedDocSet &&
                    <div>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={exactMatch}
                                    label="Exact"
                                    onChange={(ev) => setExactMatch(ev.target.checked)}
                                />}
                            label="Exact"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={allChars}
                                    label="All Terms"
                                    onChange={(ev) => setAllChars(ev.target.checked)}
                                />}
                            label="Require All"
                        />
                        <Button
                            className={classes.searchButton}
                            variant="outlined"
                            size="small"
                            onClick={handleButtonClick}
                        >
                            Search
                        </Button>
                    </div>
                }
                {matchRecords && matchRecords.length > 0 && (
                    <>
                        <IconButton
                            disabled={from === 0}
                            onClick={() => {
                                setFrom(Math.max(from - 20, 0))
                            }}
                        >
                            <ArrowBackIcon/>
                        </IconButton>
                        <Typography variant="h5"
                                    display="inline">{`Showing ${from} to ${Math.min(from + 19, count)} of ${count}`}</Typography>
                        <IconButton
                            disabled={(from + 20) >= count}
                            onClick={() => {
                                setFrom(Math.min(from + 20, count))
                            }}
                        >
                            <ArrowForwardIcon/>
                        </IconButton>
                        <List>
                            {[...matchRecords.entries()].map((mr) => (
                                <ListItem
                                    key={mr[0]}
                                    button
                                    dense
                                    onClick={() => {
                                        props.browseChapter.setSelectedBook(mr[1][1]);
                                        props.browseChapter.setSelectedChapter(mr[1][3][0]);
                                        props.app.setUrl('browseChapter');
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body1"
                                                className={[classes.boldItalicPara, classes[resultExpired ? 'expiredSearchResults' : 'searchResults']]}
                                            >
                                                {`${mr[1][2]} ${mr[1][3].join(', ')}:${Math.min(
                                                    ...mr[1][4]
                                                )}${
                                                    mr[1][4].length > 1 ? `-${Math.max(...mr[1][4])}` : ''
                                                }`}
                                            </Typography>
                                        }
                                        secondary={<Typography variant="body2" className={classes[resultExpired ? 'expiredSearchResults' : 'searchResults']}>{mr[1][5]}</Typography>}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}
                {selectedDocSet && matchRecords && matchRecords.length === 0 && (
                    <Typography variant="body2">
                        No matches - type search terms above, then click 'Search'
                    </Typography>
                )}
            </Container>
        </>);
});

export default Search;
