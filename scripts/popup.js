'use strict';
var customItems = [
{name:'youtube', url: 'www.youtube.com', background: 'fff', sortorder: 1},
{name: 'facebook', url: 'www.facebook.com', background: '1d447d', sortorder: 2},
{name: 'yahoo', url: 'www.yahoo.com', background: '3ab487', sortorder: 3},
{name: 'microsoft', url: 'www.microsoft.com', background: '205396', sortorder: 4},
{name:'amazon', url: 'www.amazon.com', background: 'f0c92c', sortorder: 5},
{name:'google', url: 'www.google.com', background: '189196', sortorder: 6},
{name: 'bing', url: 'www.bing.com', background: '2b6c90', sortorder: 7},
{name: 'msn', url: 'www.msn.com', background: '3ab0b4', sortorder: 8},
{name: 'ebay', url: 'www.ebay.com', background: '189365', sortorder: 9}
];

var config = {
  searchBy: 'google',
  wallpaper: 'default',
  solidColor: '#2f3030',
  bookmarksState: false,
  recentState: false,
  bookmarkFolderId: -1,
  activeTab: 0,
  tabs: [
    {
      id: 0,
      name: 'Main'
    }
  ]
};

var bookmarkFolders = [];

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('customItems')) {
    customItems = JSON.parse(localStorage.getItem('customItems'));
    customItems.sort(Compare);
  }
  else {
    localStorage.setItem('customItems', JSON.stringify(customItems));
  }

  // get config from local storage. and for prevent UI using set timeout.
  if (localStorage.getItem('config')) {
    config = JSON.parse(localStorage.getItem('config'));
    UI.InitilizeStartPage(config);
    UI.InitializeBookMark(config);
    UI.InitializeRecent(config);
  }
  else {
    localStorage.setItem('config', JSON.stringify(config));
    UI.InitilizeStartPage(config);
    UI.InitializeBookMark(config);
    UI.InitializeRecent(config);
  }

  // set default search type.
  const txtSearchElem = document.querySelector('#txtSearch');
  txtSearchElem.focus();
  txtSearchElem.searchType = config.searchBy;
  const imgLogoSearch = document.querySelector('.search-logo');
  switch (config.searchBy) {
    case 'google':
      imgLogoSearch.setAttribute('src', '/content/images/googleLogo.png');
      break;
    case 'bing':
      imgLogoSearch.setAttribute('src', '/content/images/bing.png');
      break;
    case 'wikipedia':
      imgLogoSearch.setAttribute('src', '/content/images/wikipedia.png');
      break;
    case 'duckduckgo':
      imgLogoSearch.setAttribute('src', '/content/images/duckduckgo.png');
      break;
  }

  for (let i = 0; i <= config.tabs.length - 1; i++) {
    UI.CreateTab(config.tabs[i], i);
  }

  var tabs = document.querySelectorAll('.tabs li');
  for (var i = 0; i < tabs.length - 1; i++) {
    TabsClickFunctionality(tabs[i]);
  }
  document.querySelector('.tabs li[data-tab-id="' + config.activeTab + '"]').click();

  // load custom sites.
  const customItemsElem = document.querySelector('.customItems');

  UI.PrepareItems(customItems.filter(function(item) {
    return !item.tabId || item.tabId === '0';
  }), customItemsElem, true);

  for (let i = 1; i < tabs.length; i++) {
    UI.PrepareItems(customItems.filter(function(item) {
      return item.tabId === i.toString();
    }), document.querySelector('#panel' + i));
  }
});

document.addEventListener('click', e => {
  e.stopPropagation();
  const searchByWrapperElem = document.getElementById('searchByWrapper');
  const txtSearchElem = document.getElementById('txtSearch');
  const imgLogoSearch = document.querySelector('.search-logo');
  const containerElem = document.querySelector('.container');
  const addPopupElem = document.querySelector('#addPopup');
  const addTabPopupElem = document.querySelector('#addTabPopup');
  const txtAddItemElem = addPopupElem.querySelector('#txtAddItem');
  const addTabNameInputElem = document.querySelector('#addTabNameInput');
  const editBoxElem = document.querySelector('#editPopup');
  const editBoxNameInputElem = document.getElementById('editBoxNameInput');
  const editBoxAddressInputElem = document.getElementById('editBoxAddressInput');
  const asideElem = document.getElementsByTagName('aside')[0];

  if (e.target.dataset.tabId) {
    document.querySelector('#hdfSelectedTab').value = e.target.dataset.tabId;
  }

  if (e.target.classList.contains('tab-close')) {
    UI.RemoveTab(e.target.parentNode);
  }

  if (e.target.classList.contains('newSiteItem')) {
    document.querySelector('.validationSummery').style.display = 'none';
    addPopupElem.style.display = 'flex';
    txtAddItemElem.focus();
    txtAddItemElem.value = '';
    return;
  }
  // remove item.
  if (e.target.classList.contains('item-remove')) {
    const parentItem = e.target.closest('.item');

    // before actual remove. fade out item.
    parentItem.classList.add('item-removeEffect');

    // remove item in DOM after about one second.
    setTimeout(function() {
      parentItem.parentNode.removeChild(parentItem);
    }, 900);

    // remove object from global object collection. and saved it in local storage.
    UI.RemoveItem(parentItem.dataset.url);

    // for prevent open link.
    e.preventDefault();
  }

  // edit box show.
  if (e.target.classList.contains('item-edit')) {
    e.preventDefault();
    editBoxElem.style.display = 'flex'; // show edit box.

    // get position of mouse click for repositioning editbox.
    const itemElem = e.target.closest('.item');

    // save url in hiddenField for search and update selected item.
    document.getElementById('hdfSelectedUrl').value = itemElem.querySelector('.item-url').innerText;

    // fill textboxes.
    editBoxNameInputElem.value = itemElem.querySelector('.item-name').innerText.toLowerCase();
    editBoxAddressInputElem.value = itemElem.querySelector('.item-url').innerText;

    // return for dont reach to defalut section of switch case.
    return;
  }

  switch (e.target.id) {
    case 'btnSearchBy':
      searchByWrapperElem.style.display = 'block';
      break;
    case 'btnGoogleSearch':
      imgLogoSearch.setAttribute('src', '/content/images/googleLogo.png');
      searchByWrapperElem.style.display = 'none';
      txtSearchElem.searchType = 'google';
      config.searchBy = txtSearchElem.searchType;
      localStorage.setItem('config', JSON.stringify(config));
      break;
    case 'btnBingSearch':
      imgLogoSearch.setAttribute('src', '/content/images/bing.png');
      searchByWrapperElem.style.display = 'none';
      txtSearchElem.searchType = 'bing';
      config.searchBy = txtSearchElem.searchType;
      localStorage.setItem('config', JSON.stringify(config));
      break;
    case 'btnWikipediaSearch':
      imgLogoSearch.setAttribute('src', '/content/images/wikipedia.png');
      searchByWrapperElem.style.display = 'none';
      txtSearchElem.searchType = 'wikipedia';
      config.searchBy = txtSearchElem.searchType;
      localStorage.setItem('config', JSON.stringify(config));
      break;
    case 'btnDuckDuckGoSearch':
      imgLogoSearch.setAttribute('src', '/content/images/duckduckgo.png');
      searchByWrapperElem.style.display = 'none';
      txtSearchElem.searchType = 'duckduckgo';
      config.searchBy = txtSearchElem.searchType;
      localStorage.setItem('config', JSON.stringify(config));
      break;
    case 'btnAddTab':
      addTabPopupElem.style.display = 'flex';
      addTabNameInputElem.focus();
      addTabNameInputElem.value = '';
      break;
    case 'addPopupClose':
      addPopupElem.style.display = 'none';
      break;
    case 'editPopupClose':
    case 'btnEditCancel':
      editBoxElem.style.display = 'none';
      break;
    case 'addTabPopupClose':
      addTabPopupElem.style.display = 'none';
      break;
    case 'btnAddTabCancel':
      addTabPopupElem.style.display = 'none';
      break;
    case 'btnAsideClose':
      asideElem.style.display = 'none';
      break;
    case 'btnSidebarShow':
      asideElem.style.display = 'block';
      break;
    default:
      searchByWrapperElem.style.display = 'none';

      // for close aside by click out side it.
      if (!e.target.closest('aside')) {
        asideElem.style.display = 'none';
      }
  }
});

document.querySelector('#frmAddTabBox').addEventListener('submit', e => {
  e.preventDefault();
  const tabName = document.querySelector('#addTabNameInput').value;
  const newTabId = parseInt(config.tabs[config.tabs.length - 1].id) + 1;

  const newTab = {
    id: newTabId,
    name: tabName
  };

  document.querySelector('#hdfSelectedTab').value = newTabId;
  const insertedTab = UI.CreateTab(newTab, newTabId);
  TabsClickFunctionality(insertedTab);
  insertedTab.click();
  config.tabs.push(newTab);
  localStorage.setItem('config', JSON.stringify(config));
  document.querySelector('#addTabPopup').style.display = 'none';
});

document.querySelector('#frmSearch').addEventListener('submit', e => {
  e.preventDefault();
  const txtSearch = document.getElementById('txtSearch');

  if (txtSearch.searchType === 'google') {
    location = 'http://www.google.com/search?q=' + encodeURIComponent(document.getElementById('txtSearch').value);
  }
  else if (txtSearch.searchType === 'bing') {
    location = 'http://www.bing.com/search?q=' + encodeURIComponent(document.getElementById('txtSearch').value);
  }
  else if (txtSearch.searchType === 'wikipedia') {
    location = 'https://en.wikipedia.org/w/index.php?search=' + encodeURIComponent(document.getElementById('txtSearch').value);
  }
  else if (txtSearch.searchType === 'duckduckgo') {
    location = 'http://www.duckduckgo.com/?q=' + encodeURIComponent(document.getElementById('txtSearch').value);
  }
});

document.querySelector('#frmAddItem').addEventListener('submit', e => {
  e.preventDefault();

  // parse new site url.
  const txtUrl = document.querySelector('#txtAddItem').value;
  const url = txtUrl;
  const name = url.substring(url.indexOf('.') + 1, url.lastIndexOf('.'));

  // check for duplicate site.
  const isDuplicateSite = customItems.filter(item => item.url.toLowerCase() === url.toLowerCase()).length > 0;

  if (isDuplicateSite === true) {
    document.querySelector('.validationSummery').style.display = 'block';
    return;
  }

  const tabId = document.querySelector('#hdfSelectedTab').value;
  const newSite = [{name: name, url: url, background: RandomColor.Get, tabId: tabId}];

  // insert new site to cutom item list.
  if (document.querySelector('#hdfSelectedTab').value !== '0') {
    const selectedTabElem = document.querySelector('#panel' + document.querySelector('#hdfSelectedTab').value);
    UI.PrepareItems(newSite, selectedTabElem);
  }
  else {
    const customItemsElem = document.getElementsByClassName('customItems')[0];
    UI.PrepareItems(newSite, customItemsElem);
  }

  // save new site in custom items object.
  customItems.push(newSite[0]);
  localStorage.setItem('customItems', JSON.stringify(customItems));

  // hide new site popup.
  const addPopupElem = document.querySelector('#addPopup');
  addPopupElem.style.display = 'none';


  // remove suggestion list in add popup.
  const addPopupSuggestionsElem = document.querySelector('.addPopup-suggestions');
});

document.querySelector('#frmEditBox').addEventListener('submit', e => {
  e.preventDefault();
  const editBoxElem = document.querySelector('#editPopup');
  editBoxElem.style.display = 'none';

  const oldUrl = document.getElementById('hdfSelectedUrl').value;
  const newName = document.getElementById('editBoxNameInput').value;
  const newUrl = document.getElementById('editBoxAddressInput').value;
  const newBackgroundColor = document.getElementById('hdfBackgroundColor').value;

  UI.UpdateItem(oldUrl, newName, newUrl, newBackgroundColor, () => {
    const updatedItem = document.querySelector('.item[data-url="' + oldUrl + '"]');
    updatedItem.dataset.url = newUrl;
    updatedItem.querySelector('.item-name').innerText = newName;
    updatedItem.querySelector('.item-url').innerText = newUrl;
    updatedItem.style.backgroundColor = newBackgroundColor;
  });
});

document.querySelector('#txtSearch').addEventListener('keyup', e => {
  const queryText = e.target.value;

  // using google suggested service.
  Services.GetSuggestedList(queryText, suggestedList => {
    const datalist = document.getElementById('suggestedDatalist');
    UI.ClearAllChilds(datalist);
    for (var i = 0; i < suggestedList.length; i++) {
      const newOption = document.createElement('option');
      newOption.setAttribute('value', suggestedList[i].getAttribute('data'));
      datalist.appendChild(newOption);
    }
  });
});

document.querySelector('#txtAddItem').addEventListener('keyup', e => {
  const query = e.target.value;
  chrome.history.search({text:query}, visitedURL => {
    const datalist = document.getElementById('historySuggestedDatalist');
    UI.ClearAllChilds(datalist);
    for (var i = 0; i < visitedURL.length; i++) {
      const newOption = document.createElement('option');
      newOption.setAttribute('value', visitedURL[i].title);
      datalist.appendChild(newOption);
    }
  });
});

function Compare(a, b) {
  if (parseInt(a.sortorder) > parseInt(b.sortorder)) {
    return 1;
  }
  if (parseInt(a.sortorder) < parseInt(b.sortorder)) {
    return -1;
  }
  return 0;
}

document.getElementById('wallpaperMode').addEventListener('change', ({target}) => {
  config.wallpaper = target.value;
  localStorage.setItem('config', JSON.stringify(config));
  UI.InitilizeStartPage(config);
});

document.getElementById('bookmarksMode').addEventListener('change', ({target}) => {
  config.bookmarksState = (target.value === 'false') ? false : true;
  localStorage.setItem('config', JSON.stringify(config));
  UI.InitializeBookMark(config);
});

document.getElementById('recentMode').addEventListener('change', ({target}) => {
  config.recentState = (target.value === 'false') ? false : true;
  localStorage.setItem('config', JSON.stringify(config));
  UI.InitializeRecent(config);
});

document.getElementById('color').addEventListener('change', ({target}) => {
  config.solidColor = target.value;
  localStorage.setItem('config', JSON.stringify(config));
  UI.InitilizeStartPage(config);
});

document.getElementById('backColorElem').addEventListener('change', ({target}) => {
  document.getElementById('hdfBackgroundColor').value = target.value;
});

document.getElementById('bookmarkSelectElem').addEventListener('change', ({target}) => {
  config.bookmarkFolderId = parseInt(target.value);
  localStorage.setItem('config', JSON.stringify(config));
  UI.CreateBookmarks(config);
});

function TabsClickFunctionality(tab) {
    tab.addEventListener('click', e => {
      config.activeTab = parseInt(e.target.dataset.tabId);
      localStorage.setItem('config', JSON.stringify(config));
      var panels = document.querySelectorAll('.panelContainer .panel');
      for (let j = 0; j < panels.length; j++) {
        panels[j].style.visibility = 'hidden';
        panels[j].style.height = '0';
        panels[j].style.padding = '0';
      }

      var activeTab = document.querySelector('.tabs li.active');
      if (activeTab) {
        activeTab.classList.remove('active');
      }
      e.target.classList.add('active');
      var panel = e.target.dataset.panelId;
      if (panel !== null) {
        var newActivTab = document.getElementById(panel);
        newActivTab.style.visibility = 'visible';
        newActivTab.style.height = 'auto';
        newActivTab.style.padding = '50px';
        newActivTab.style.paddingTop = '0';
      }
      return false;
    });
}
