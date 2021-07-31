import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import styles from '../../../global_styles';
import VerseNavigation from '../../../sharedComponents/VerseNavigation';
import Container from "@material-ui/core/Container";
import DocSetPicker from "../../../sharedComponents/DocSetPicker";
import BookPicker from "../../../sharedComponents/BookPicker";
import InspectQuery from "../../../sharedComponents/InspectQuery";
import ChapterNavigation from "../../../sharedComponents/ChapterNavigation";
import BrowseModeButton from "../../../sharedComponents/BrowseModeButton";

const BrowseVerse = withStyles(styles)((props) => {
    const {classes} = props;
    const [result, setResult] = React.useState({});
    const [query, setQuery] = React.useState('');
    const verseQueryTemplate =
        '{\n' +
        '  docSet(id:"%docSetId%") {\n' +
        '    document(bookCode: "%bookCode%") {\n' +
        '      title: header(id: "toc2")\n' +
        '      cv (chapter:"%chapter%" verses:["%verse%"]) { text }\n' +
        '      nav: cvNavigation(chapter:"%chapter%" verse: "%verse%") {\n' +
        '        previousVerse { chapter verse }\n' +
        '        nextVerse { chapter verse }\n' +
        '        previousChapter\n' +
        '        nextChapter\n' +
        '      }\n' +
        '    }\n' +
        '  }\n' +
        '}';
    React.useEffect(() => {
        const doQuery = async () => {
            if (props.browseVerse.selectedDocSet && props.browseVerse.selectedBook) {
                const verseQuery = verseQueryTemplate
                    .replace(/%docSetId%/g, props.browseVerse.selectedDocSet)
                    .replace(/%bookCode%/g, props.browseVerse.selectedBook)
                    .replace(/%chapter%/g, props.browseVerse.selectedChapter)
                    .replace(/%verse%/g, props.browseVerse.selectedVerse);
                setQuery(verseQuery);
                const res = await props.pk.gqlQuery(verseQuery);
                setResult(res);
            }
        };
        doQuery();
    }, [
        props.browseVerse.selectedDocSet,
        props.browseVerse.selectedBook,
        props.browseVerse.selectedChapter,
        props.browseVerse.selectedVerse,
    ]);

    React.useEffect(() => {
        if (props.browseVerse.selectedDocSet) {
            props.browseVerse.selectedBook || props.browseVerse.setSelectedBook(
                props.app.docSets
                    .filter(ds => ds.id === props.browseVerse.selectedDocSet)[0]
                    .documents[0]
                    .bookCode
            );
            props.browseVerse.selectedChapter || props.browseVerse.setSelectedChapter(1);
            props.browseVerse.selectedVerse || props.browseVerse.setSelectedVerse(1);
        }
    }, [props.browseVerse.selectedDocSet]);

    return (
        <>
            <div className={classes.toolbarMargin}/>
            <Container className={classes.page}>
                <div>
                    <DocSetPicker
                        selectedDocSet={props.browseVerse.selectedDocSet}
                        setSelectedDocSet={props.browseVerse.setSelectedDocSet}
                        app={props.app}
                    />
                    {props.app.docSets && props.browseVerse.selectedDocSet ?
                        <BookPicker
                            selectedDocSet={props.browseVerse.selectedDocSet}
                            selectedBook={props.browseVerse.selectedBook}
                            setSelectedBook={props.browseVerse.setSelectedBook}
                            setSelectedChapter={props.browseVerse.setSelectedChapter}
                            setSelectedVerse={props.browseVerse.setSelectedVerse}
                            app={props.app}
                        /> :
                        <Typography variant="h5" display="inline" className={classes.requireInput}>Please Select a
                            DocSet</Typography>
                    }
                    <InspectQuery app={props.app} raw={props.raw} query={query}/>
                    <BrowseModeButton
                        label="Browse Chapter"
                        url="browseChapter"
                        app={props.app}
                        targetState={props.browseChapter}
                        selectedDocSet={props.browseVerse.selectedDocSet}
                        selectedBook={props.browseVerse.selectedBook}
                        selectedChapter={props.browseVerse.selectedChapter}
                    />
                </div>
                <div>
                    {
                        'data' in result && 'docSet' in result.data && 'document' in result.data.docSet ?
                            <>
                                <ChapterNavigation
                                    setSelectedChapter={props.browseVerse.setSelectedChapter}
                                    setSelectedVerse={props.browseVerse.setSelectedVerse}
                                    direction="previous"
                                    destination={result.data.docSet.document.nav.previousChapter}
                                />
                                <VerseNavigation
                                    setSelectedChapter={props.browseVerse.setSelectedChapter}
                                    setSelectedVerse={props.browseVerse.setSelectedVerse}
                                    direction="previous"
                                    destination={result.data.docSet.document.nav.previousVerse}
                                />
                            </> : ''
                    }
                    <Typography variant="body1" display="inline" className={classes.browseNavigationText}>
                        {`${props.browseVerse.selectedChapter || '-'}:${props.browseVerse.selectedVerse || '-'}`}
                    </Typography>
                    {
                        'data' in result && 'docSet' in result.data && 'document' in result.data.docSet ?
                            <>
                                <VerseNavigation
                                    setSelectedChapter={props.browseVerse.setSelectedChapter}
                                    setSelectedVerse={props.browseVerse.setSelectedVerse}
                                    direction="next"
                                    destination={result.data.docSet.document.nav.nextVerse}
                                />
                                <ChapterNavigation
                                    setSelectedChapter={props.browseVerse.setSelectedChapter}
                                    setSelectedVerse={props.browseVerse.setSelectedVerse}
                                    direction="next"
                                    destination={result.data.docSet.document.nav.nextChapter}
                                />
                            </> : ''
                    }
                </div>
                {
                    'data' in result && 'docSet' in result.data && 'document' in result.data.docSet && 'cv' in result.data.docSet.document ? (
                        <Typography variant="body1">
                            {result.data.docSet.document.cv[0].text}
                        </Typography>
                    ) : (
                        <Typography variant="body1">No Results</Typography>
                    )
                }
            </Container>
        </>
    );
});

export default BrowseVerse;
