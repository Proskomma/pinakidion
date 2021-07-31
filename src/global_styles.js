const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  toolbarMargin:
    theme.mixins.toolbar,
  flex: {
    flex: 1,
  },
  content: {
    display: "flex",
    padding: "10px",
    height: "100%",

    flexDirection:"column",
  },
  footer: {
    padding: "5px",
    display: "block",
  },
  palette: {
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
  para: {
    marginBottom: '3px',
  },
  italicPara: {
    marginBottom: '3px',
    fontStyle: 'italic',
  },
  boldPara: {
    marginBottom: '3px',
    fontWeight: 'bold',
  },
  boldItalicPara: {
    marginBottom: '3px',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  loading: {
    paddingLeft: '50px',
    paddingTop: '10px',
    paddingBottom: '50px',
  },
  page: {
    paddingTop: "10px",
    paddingBottom: "10px",
  },
  browseModeButton: {
    marginLeft: "1em",
    float: "right",
  },
  browseNavigationText: {
    fontWeight: "bold",
    fontSize: "larger",
  },
  pre: {
    whiteSpace: "pre",
    fontFamily: "monospace",
  },
  pkQueryTextarea: {
    width: "100%",
  },
  pkQueryButton: {
    float: "right",
  },
  pkQueryPreviousQueries: {
    color: "blue",
    textDecoration: "underline",
    fontSize: "50%",
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  pkQueryPreviousQueryItem: {
    color: "blue",
    textDecoration: "underline",
    fontSize: "x-small",
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    textIndent: '-2em',
  },
  pkQueryPreviousQueriesTitle: {
    marginTop: '20px',
    fontWeight: 'bold',
  },
  searchTerms: {
    width: '90%'
  },
  searchButton: {
    float: 'right',
  },
  searchResults: {},
  expiredSearchResults: {
    color: "#999",
  },
  grid: {
    border: "solid 1px black",
    marginTop: "10px",
    marginBottom: "10px",
  },
  gridItem: {
    border: "solid 1px black",
  },
  inspectQuery: {
    float: "right",
    marginLeft: "10px",
  },
  chapterElement: {
    backgroundColor: "#EEE",
    paddingLeft: "0.2em",
    paddingRight: "0.2em",
    marginRight: "0.4em",
  },
  versesElement: {
    backgroundColor: "#EEE",
    fontSize: "smaller",
    fontWeight: "bold",
    paddingLeft: "0.2em",
    paddingRight: "0.2em",
    marginRight: "0.4em",
  },
  newDocSetButton: {
    float: "right",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  requireInput: {
    color: '#D00',
  },
});

export default styles;
