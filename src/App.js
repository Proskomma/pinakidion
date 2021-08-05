import fse from 'fs-extra';
import path from "path";
import React, {useEffect, useState} from 'react';
import ToolBar from '@material-ui/core/Toolbar';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import {UWProskomma} from 'uw-proskomma';

import './App.css';

import {pages, pagesArray, stateSpec} from './conf.js';

const pk = new UWProskomma();
const sharedState = {app: {url: 'about'}};
const mappingQueries = [];
const translationSources = [
    './data/unfoldingWord_en_ult_pkserialized.json',
    './data/unfoldingWord_en_ust_pkserialized.json',
    './data/unfoldingWord_hbo_uhb_pkserialized.json',
    './data/unfoldingWord_grc_ugnt_pkserialized.json',
    './data/ebible_fr_lsg_pkserialized.json',
].map((ts) => path.resolve(ts));

const draftSources =
    (fse.existsSync('./data/home') ?
        fse.readdirSync('./data/home').filter(f => f.endsWith('_pkserialized.json')) :
        [])
        .map((ts) => path.resolve('./data/home', ts));
const styles = theme => ({});

const App = withStyles(styles)(props => {
    const {classes} = props;
    const [menuAnchor, setMenuAnchor] = useState(null);
    [sharedState.app.url, sharedState.app.setUrl] = useState('home');
    [sharedState.app.docSets, sharedState.app.setDocSets] = useState([]);
    [sharedState.app.nMutations, sharedState.app.setNMutations] = useState(0);
    for (const [sName, sStates] of Object.entries(stateSpec)) {
        sharedState[sName] = {};
        for (const [stateName, stateInit] of sStates) {
            [sharedState[sName][stateName], sharedState[sName][`set${stateName.slice(0, 1).toUpperCase() + stateName.slice(1)}`]] = useState(stateInit);
        }
    }

    const clearAnchor = () => setMenuAnchor(null);

    const pageBody = () => {
        const page = pages[sharedState.app.url] || pages.data;
        return <page.pageClass pk={pk} {...sharedState}/>;
    }

    useEffect(() => {
            const loadTranslation = async (translationSource, count) => {
                await pk.loadSuccinctDocSet(fse.readJsonSync(translationSource));
                sharedState.app.setNMutations(count);
                return true;
            }
            const loadTranslations = async () => {
                let count = 1;
                for (const translationSource of translationSources) {
                    await loadTranslation(translationSource, count);
                    count++;
                }
                for (const draftSource of draftSources) {
                    await loadTranslation(draftSource, count);
                    count++;
                }
            }
            const loadMappings = async () => {
                for (const query of mappingQueries) {
                    await pk.gqlQuery(query);
                }
            };
            loadTranslations()
                .then(
                    () =>
                        loadMappings()
                            .then(
                                () => {
                                }
                            )
                );
        }, []
    );

    return (
        <div className={classes.root}>
            <AppBar position="fixed">
                <ToolBar>
                    <IconButton
                        color="inherit"
                        aria-label="Menu"
                        onClick={e => setMenuAnchor(e.currentTarget)}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={clearAnchor}
                    >
                        {
                            pagesArray
                                .filter(pe => pe.menuEntry.length > 0)
                                .map(
                            p =>
                                <MenuItem
                                    component="div"
                                    key={p.url}
                                    onClick={
                                        () => {
                                            sharedState.app.setUrl(p.url);
                                            clearAnchor();
                                        }
                                    }
                                >
                                    {p.menuEntry}
                                </MenuItem>
                        )
                        }
                    </Menu>
                    <Typography variant="title">
                        {pages[sharedState.app.url || 'home'].pageTitle}
                    </Typography>
                </ToolBar>
            </AppBar>
            <div>{pageBody()}</div>
        </div>
    );
});

export default App;
