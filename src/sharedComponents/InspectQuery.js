import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import styles from '../global_styles';

const InspectQuery = withStyles(styles)((props) => {
    const {classes} = props;
    return (
        <Button
            className={classes.inspectQuery}
            variant="contained"
            size="small"
            onClick={() => {
                props.raw.setQuery(props.query);
                props.app.setUrl('raw');
            }}
        >
            Inspect Query
        </Button>
    );
});

export default InspectQuery;
