import React from 'react';
import Typography from "@material-ui/core/Typography";
import aghastModel from "proskomma-render-aghast";

const Edit = (props) => {
    const [result, setResult] = React.useState({});
    const [aghast, setAghast] = React.useState({});
    const editQueryTemplate = '{' +
        '  docSets(withTags:["draft"] ids:"%docSetId%") {' +
        '    id' +
        '    selectors { key value }' +
        '    tags' +
        '    documents {' +
        '      id' +
        '      headers { key value }' +
        '      idParts { type parts }' +
        '      tags' +
        '      sequences {' +
        '        id' +
        '        type' +
        //        '        tags' +
        '        blocks {' +
        '          bs { payload }' +
        '          bg { subType payload }' +
        '          items { type subType payload }' +
        '        }' +
        '      }' +
        '    }' +
        '  }' +
        '}';
    React.useEffect(() => {
        const doQuery = async () => {
            const editQuery = editQueryTemplate
                .replace(/%docSetId%/g, props.edit.docSetId)
            return await props.pk.gqlQuery(editQuery);
        };
        doQuery().then((res) => {
            if (res.errors) {
                console.log(res.errors);
            }
            setResult(res);
            if (res.data) {
                const config = {};
                const model = aghastModel(res.data, config);
                model.render();
                setAghast(config.aghast);
            }
        });
    }, [props.pk, props.edit]);
    return (
        !result.data ? (
            <h2 style={{paddingTop: "100px"}}>
                Loading...
            </h2>
        ) : (
            <div style={{paddingTop: "100px"}}>
                <Typography variant="h5">{props.edit.bookCode}</Typography>
                <pre>{JSON.stringify(aghast, null, 2)}</pre>
            </div>
        )
    )
};

export default Edit;
