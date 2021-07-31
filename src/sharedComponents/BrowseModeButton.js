import React from 'react';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import styles from '../global_styles';

const BrowseModeButton = withStyles(styles)((props) => {
  const { classes } = props;
  return (
    <Button
      className={classes.browseModeButton}
      variant="outlined"
      size="small"
      onClick={() => {
          props.selectedDocSet && props.targetState.setSelectedDocSet(props.selectedDocSet);
          props.selectedBook && props.targetState.setSelectedBook(props.selectedBook);
          props.selectedChapter && props.targetState.setSelectedChapter(props.selectedChapter);
          props.selectedVerse && props.targetState.setSelectedVerse(props.selectedVerse);
          props.url && props.app.setUrl(props.url);
      }}
    >
      {props.label}
    </Button>
  );
});

export default BrowseModeButton;
