import BrowseChapter from './BrowseChapter';

const conf = {
  url: "browseChapter",
  menuEntry: "Browse by Chapter",
  pageTitle: "Browse by Chapter",
  description: "View Scripture by chapter",
  pageClass: BrowseChapter,
  state: [
    ['selectedDocSet', null],
    ['selectedBook', null],
    ['selectedChapter', null],
  ],
};

export default conf;
