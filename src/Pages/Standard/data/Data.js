import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import styles from '../../../global_styles';
import DocSet from './DocSet';
import InspectQuery from "../../../sharedComponents/InspectQuery";

const Data = withStyles(styles)((props) => {
        const {classes} = props;
        const [result, setResult] = React.useState('');
        const homeQuery =
            '{' +
            '  nDocSets nDocuments\n' +
            '  docSets {\n' +
            '    id hasMapping\n' +
            '    documents { id' +
            '    bookCode: header(id:"bookCode")' +
            '    name: header(id:"toc2")}\n' +
            '  }\n' +
            '}\n';
        React.useEffect(() => {
            const doQuery = async () => {
                return await props.pk.gqlQuery(homeQuery);
            };
            doQuery().then((res) => {
                setResult(res);
                if (res.data) {
                    props.app.setDocSets(res.data.docSets);
                }
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
                        <InspectQuery app={props.app} raw={props.raw} query={homeQuery}/>
                        <Typography variant="body1">
                            {`${
                                result.data ? result.data.nDocSets : '0'
                            } docSet(s) containing ${
                                result.data ? result.data.nDocuments : '0'
                            } document(s)`}
                        </Typography>
                        <List>
                            {result.data.docSets.map((ds, index) => (
                                <ListItem key={index} button dense>
                                    <DocSet key={ds.id} state={props.state} docSet={ds}/>
                                </ListItem>
                            ))}
                        </List>
                    </Container>
                )}
            </>
        );
    }
);

export default Data;