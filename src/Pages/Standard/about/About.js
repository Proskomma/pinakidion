import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import styles from '../../../global_styles';
import InspectQuery from "../../../sharedComponents/InspectQuery";

const packageJson = require('../../../../package.json');

const About = withStyles(styles)((props) => {
    const {classes} = props;
    const [result, setResult] = React.useState({});
    const aboutQuery =
        '{' +
        '  processor packageVersion' +
        '}\n';
    React.useEffect(() => {
        const doQuery = async () => {
            return await props.pk.gqlQuery(aboutQuery);
        };
        doQuery().then((res) => {
            setResult(res);
            if (res.data) {
                props.app.setDocSets(res.data.docSets);
            }
        });
    }, [props.pk, props.app.nMutations]);
    const name = packageJson.name.slice(0, 1).toUpperCase() + packageJson.name.slice(1);
    return (
        <>
            <div className={classes.toolbarMargin}/>
            {!result.data ? (
                <Typography variant="h2" className={classes.loading}>
                    Loading...
                </Typography>
            ) : (
                <Container className={classes.page}>
                    <InspectQuery app={props.app} raw={props.raw} query={aboutQuery}/>
                    <>
                        <Typography variant="h5" className={classes.docSetsSection}>
                            {`${name} v${packageJson.version}`}
                        </Typography>
                        <Typography variant="body1" className={classes.docSetsSection}>
                            {packageJson.description}
                        </Typography>
                         <Typography variant="body2" className={classes.docSetsSection}>
                            {packageJson.homepage}
                        </Typography>
                        <Typography variant="body2" className={classes.docSetsSection}>
                            {`Using ${result.data.processor} v${result.data.packageVersion}`}
                        </Typography>
                        <Typography variant="body2" className={classes.docSetsSection}>
                            {`© ${packageJson.author}, ${packageJson.license} license`}
                        </Typography>
                    </>
                </Container>
            )}
        </>
    )
});

export default About;
