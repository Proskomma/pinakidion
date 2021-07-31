import React from 'react';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from '@material-ui/core/styles';

import styles from '../global_styles';

const BookPicker = withStyles(styles)((props) => {
    const {classes} = props;
    const changeSelectedBook = (e) => {
        const newBook = e.target.value;
        props.setSelectedBook(newBook);
        props.setSelectedChapter && props.setSelectedChapter(1);
        props.setSelectedVerse && props.setSelectedVerse(1);
    };

    return (
        <FormControl className={classes.formControl}>
            <InputLabel id="book-picker-label">Book</InputLabel>
            <Select
                labelId="book-picker-label"
                value={props.selectedBook}
                onChange={changeSelectedBook}
            >
                {
                    props.app.docSets
                        .filter(ds => ds.id === props.selectedDocSet)[0]
                        .documents
                        .map((d) => (
                            <MenuItem
                                value={d.bookCode}
                                key={d.bookCode}
                            >
                                {d.name}
                            </MenuItem>
                        ))
                }
            </Select>
        </FormControl>
    );
});

export default BookPicker;
