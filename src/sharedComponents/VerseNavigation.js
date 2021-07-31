import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import styles from '../global_styles';

const VerseNavigation = withStyles(styles) (
  (props) => {
  return (
    <IconButton
      aria-label={props.direction}
      disabled={!props.destination}
      onClick={() => {
        props.setSelectedChapter(props.destination.chapter);
        props.setSelectedVerse(props.destination.verse);
      }}
    >
      {props.direction === 'previous' ? <ArrowLeftIcon fontSize="large" /> : <ArrowRightIcon fontSize="large"/>}
    </IconButton>
  );
});

export default VerseNavigation;
