import browseVerseConf from './Pages/Standard/browseVerse/conf';
import browseChapterConf from './Pages/Standard/browseChapter/conf';
import searchConf from './Pages/Standard/search/conf';
import rawConf from './Pages/Standard/rawQuery/conf';
import aboutConf from './Pages/Standard/about/conf';

const pagesArray = [
    browseVerseConf,
    browseChapterConf,
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
