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

const SaveButton = (props) => {
    return <Button
        variant="outlined"
        size="small"
        disabled={!props.edited}
        onClick={() => {
            saveAghast(props.aghast);
            props.setEdited(false);
        }}
    >
        Save
    </Button>;
};

export { ShowAghastButton, SaveButton };
