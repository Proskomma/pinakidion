import React from 'react';

const Edit = (props) => {
    const [result, setResult] = React.useState({});
    const aboutQuery = '{id}\n';
    React.useEffect(() => {
        const doQuery = async () => {
            return await props.pk.gqlQuery(aboutQuery);
        };
        doQuery().then((res) => {
            setResult(res);
        });
    }, [props.pk]);
    return (
        !result.data ? (
            <h2>
                Loading...
            </h2>
        ) : (
            <div style={{paddingTop: "100px"}}>
                Your Proskomma ID is {result.data.id}
            </div>
        )
    )
};

export default Edit;
