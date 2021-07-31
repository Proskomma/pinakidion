import React from 'react';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from '@material-ui/core/styles';

import styles from '../global_styles';

const DocSetPicker = withStyles(styles) ((props) => {
        const {classes} = props;
        const changeSelectedDocSet = (e) => {
            const newDocSetId = e.target.value;
            props.setSelectedDocSet(newDocSetId);
        };

        return (
            <FormControl className={classes.formControl}>
                <InputLabel id="docset-picker-label">DocSet</InputLabel>
                <Select
                    labelId="docset-picker-label"
                    value={props.selectedDocSet}
                    onChange={changeSelectedDocSet}
                >
                    {props.app.docSets.map((ds) => (
                        <MenuItem
                            value={ds.id}
                            key={ds.id}
                        >
                            {ds.id}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    });

export default DocSetPicker;
