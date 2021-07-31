import BrowseVerse from './BrowseVerse';

const conf = {
  url: "browseVerse",
  menuEntry: "Browse by Verse",
  pageTitle: "Browse by Verse",
  description: "View Scripture verse by verse",
  pageClass: BrowseVerse,
  state: [
    ['selectedDocSet', null],
    ['selectedBook', null],
    ['selectedChapter', null],
    ['selectedVerse', null],
  ],
};

export default conf;
