import searchConf from './Pages/Standard/search/conf';
import rawConf from './Pages/Standard/rawQuery/conf';
import aboutConf from './Pages/Standard/about/conf';
import homeConf from './Pages/MyPages/home/conf';
import editConf from './Pages/MyPages/edit/conf';

const pagesArray = [
    homeConf,
    editConf,
    searchConf,
    rawConf,
    aboutConf,
];
let pages = {};
let stateSpec = {};
for (const page of pagesArray) {
    pages[page.url] = page;
    stateSpec[page.url] = page.state || [];
}

export {pagesArray, pages, stateSpec};
