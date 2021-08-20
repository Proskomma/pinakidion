import Button from "@material-ui/core/Button";
import saveAghast from "./save_aghast";
import React from "react";

const ShowAghastButton = (props) => {
    return <Button
        variant="outlined"
        size="small"
        onClick={() => {
            props.setShowAghast(!(props.showAghast));
        }}
    >
        Show AGHAST
    </Button>;
}

const SearchButton = (props) => {
    return <Button
        variant="outlined"
        size="small"
        onClick={() => {
            props.search.setDocSetId(props.edit.docSetId);
            props.app.setUrl('search');
        }}
    >
        Search
    </Button>;
};

const SaveButton = (props) => {
    return <Button
        variant="outlined"
        size="small"
        disabled={!props.edited}
        onClick={() => {
            saveAghast(props.aghast, props.setToWrite);
            props.setEdited(false);
        }}
    >
        Save
    </Button>;
};

export { ShowAghastButton, SearchButton, SaveButton };
