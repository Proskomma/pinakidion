import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import FFIcon from '@material-ui/icons/FastForward';
import FRIcon from '@material-ui/icons/FastRewind';
import styles from '../global_styles';

const ChapterNavigation = withStyles(styles) (
  (props) => {
  return (
    <IconButton
      aria-label={props.direction}
      disabled={!props.destination}
      onClick={() => {
          props.setSelectedChapter(props.destination);
          if (props.setSelectedVerse) {
              props.setSelectedVerse(1);
          }
      }}
    >
      {props.direction === 'previous' ? <FRIcon/> : <FFIcon/>}
    </IconButton>
  );
});

export default ChapterNavigation;
