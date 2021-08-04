import Edit from './Edit';

const conf = {
  url: "edit",
  menuEntry: "Edit",
  pageTitle: "Scripture Editor",
  description: "A Scripture Editor",
  pageClass: Edit,
  state: [
    ['docSetId', null],
    ['documentId', null],
    ['bookCode', null],
    ['sequenceId', null],
  ],
};

export default conf;
