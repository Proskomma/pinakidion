import React from 'react';

import ListItemText from '@material-ui/core/ListItemText';

const DocSet = (props) => {
  return (
    <ListItemText
      primary={props.docSet.id}
      secondary={`${props.docSet.documents.length} documents with${props.docSet.hasMapping ? '' : 'out'} verse mapping`}
    />
  );
};

export default DocSet;
