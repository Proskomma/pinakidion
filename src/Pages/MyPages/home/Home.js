import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from "@material-ui/core/Typography";
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import styles from "../../../global_styles";

import NewDocSetDialog from "./NewDocSetDialog";

const Home = withStyles(styles)((props) => {
    const {classes} = props;
    const [result, setResult] = React.useState({});
    const [newOpen, setNewOpen] = React.useState(false);
    const [selectedDraft, setSelectedDraft] = React.useState('');

    const handleClickOpen = () => {
        setNewOpen(true);
    };

    const draftsQuery = '{\n' +
        'selectors { name regex }\n' +
        '  docSets {\n' +
        '    id\n' +
        '    isDraft: hasTag(tagName:"draft")' +
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
        <>
            <div className={classes.toolbarMargin}/>
            {!result.data ? (
                <Typography variant="h2" className={classes.loading}>
                    Loading...
                </Typography>
            ) : (
                <Container className={classes.page}>
                    <List>
                        {result.data && result.data.docSets.map((ds, index) => (
                            <ListItem
                                key={index}
                                button
                                dense
                                onClick={() => selectedDraft === ds.id ? setSelectedDraft('') : setSelectedDraft(ds.id)}>
                                <ListItemText primary={`${ds.id} ${ds.isDraft ? '(draft)' : '(read only)'}`}
                                              secondary={selectedDraft === ds.id ? <List>
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
                    <Fab
                        color="primary"
                        aria-label="add"
                        style={{position: 'absolute',
                            top: "100px",
                            right: "20px",
                        }}
                        onClick={handleClickOpen}
                    >
                        <AddIcon />
                    </Fab>
                    <NewDocSetDialog
                        pk={props.pk}
                        result={result}
                        newOpen={newOpen}
                        setNewOpen={setNewOpen}
                        app={props.app}
                    />
                </Container>
            )
            }
        </>
    )
});

export default Home;
