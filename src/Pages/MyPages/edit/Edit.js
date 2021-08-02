import React from 'react';
import Typography from "@material-ui/core/Typography";

const Edit = (props) => {
    const [result, setResult] = React.useState({});
    const editQuery = '{' +
        `document(id:"${props.edit.documentId}") {\n` +
         'idParts { parts }' +
        'mainBlocks { text }' +
        '}' +
        '}\n';
    React.useEffect(() => {
        const doQuery = async () => {
            return await props.pk.gqlQuery(editQuery);
        };
        doQuery().then((res) => {
            setResult(res);
        });
    }, [props.pk, props.edit]);
    return (
        !result.data ? (
            <h2>
                Loading...
            </h2>
        ) : (
            <div style={{paddingTop: "100px"}}>
                <Typography variant="h5">{result.data.document.idParts.parts[1]} ({result.data.document.idParts.parts[0]})</Typography>
                {result.data.document.mainBlocks.map(b => <Typography variant="body">{b.text}</Typography>)}
            </div>
        )
    )
};

export default Edit;
