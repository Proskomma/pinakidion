import Search from './Search';

const conf = {
  url: "search",
  menuEntry: "Search",
  pageTitle: "Search",
  description: "Search a docSet",
  pageClass: Search,
  state: [
    ['docSetId', null],
  ],
};

export default conf;
