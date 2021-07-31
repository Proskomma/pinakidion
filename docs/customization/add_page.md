# Adding a new page

## Creating a new page

Example files have been placed in the codebase to facilitate this. They can be found in:
**chaliki > src > Pages > MyPages**

Each new page requires a folder, the example one inside **My Pages** is named **myPage**.

Inside **myPage** we have two files named **conf.js** and **MyPage.js**.

The first file, **conf.js** allows you to set the name the new page will have in the menu, along with some other information.

The second file **MyPage.js** contains the actual content of the page.

## Adding the new page to Chaliki

In order to import this new page into Chaliki you then have to edit the following file:
**chaliki > src > conf.js**

First you have to import the new page at the top by adding the variable name for the new page and the relative path of the new **conf.js**, in this case:
**import myPage from './Pages/MyPages/myPage/conf'**

And then finally add this variable to **pagesArray** at the point in the list where you would like it to appear:
const pagesArray = [
    ...
    aboutConf,
    **myPage,**
];
