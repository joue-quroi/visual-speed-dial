'use strict';

var UI = {
  PrepareItems: (itemCollection, targetElement, isSortable = false, randomColor = false) => {
    const itemsGenerator = new CreateItems(itemCollection, randomColor);
    const htmlItems = itemsGenerator.GetItems;

    let counter = 0.4;
    for (var htmlItem in htmlItems) {
      let foreColor = 'fff';

      if (htmlItems[htmlItem].style.background) {
        htmlItems[htmlItem].querySelector('.item-name').style.display = 'none';
      }
      else if (htmlItems[htmlItem].style.backgroundColor === 'rgb(255, 255, 255)') {
        foreColor = '000';
      }

      const itemNameElem = htmlItems[htmlItem].querySelector('.item-name');
      const itemOperationsElem = htmlItems[htmlItem].querySelector('.item-operations');
      itemNameElem.style.color = '#' + foreColor;
      itemOperationsElem.style.color = '#' + foreColor;

      htmlItems[htmlItem].style.animationDelay = counter + 's';

      counter += 0.015;
      targetElement.appendChild(htmlItems[htmlItem]);
      UI.ResizeFont(itemNameElem);
    }
    if (isSortable) {
      UI.SortItems(targetElement);
    }
  },
  ResizeFont: element => {
    while (element.offsetWidth > 170) {
      let actualSize = getComputedStyle(element, null).getPropertyValue('font-size');
      actualSize = actualSize.replace('px', '');
      element.style.fontSize = parseInt(actualSize) - 1 + 'px';
    }
  },
  RemoveItem: url => {
    customItems = customItems.filter(obj => obj.url !== url);
    localStorage.setItem('customItems', JSON.stringify(customItems));
  },
  UpdateItem: (oldUrl, newName, newUrl, newBackgroundColor, callback) => {
    customItems.forEach(function(obj) {
      if (obj.url.toLowerCase() === oldUrl.toLowerCase()) {
        obj.name = newName;
        obj.url = newUrl;
        obj.background = newBackgroundColor.substring(1, newBackgroundColor.length);
      }
    });
    localStorage.setItem('customItems', JSON.stringify(customItems));
    callback();
  },
  SortItems: element => {
    Sortable.create(element, {
      animation: 500,
      filter: '.newSiteItem',
      onStart: () => {
        const items = element.getElementsByClassName('item');
        for (let i = 0; i < items.length; i++) {
          items[i].style.animation = 'none'; // disable hover effect
          items[i].style.opacity = 1;
        }
      },
      onMove: e => {
        if (e.related.id === 'btnNewSiteItem') {
          return false;
        }
      },
      onEnd: () => {
        const items = element.getElementsByClassName('item');
        for (var i = 1; i < items.length; i++) {
          items[i].setAttribute('data-sortorder', i);
          let finedItem = customItems.find(p => p.url === items[i].getAttribute('data-url'));
          finedItem.sortorder = i;
        }
        localStorage.setItem('customItems', JSON.stringify(customItems));
      }
    });
  },
  ClearAllChilds: parent => {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  },
  CreateBookmarks: config => {
    const id = config.bookmarkFolderId;
    const bookmarkList = [];
    chrome.bookmarks.getChildren(id.toString(), childrenList => {
      for (var i = 0; i < childrenList.length; i++) {
        // if this child is not a folder.
        if (childrenList[i].url) {
          bookmarkList.push({name: childrenList[i].title, url: childrenList[i].url});
        }
      }

      // create items on the page.
      const bookmarksElem = document.querySelector('.bookmarks');
      UI.ClearAllChilds(bookmarksElem);
      UI.PrepareItems(bookmarkList, bookmarksElem, false, true);
    });
  },
  FillBookmarks: bookmarkFolders => {
    const selectElem = document.getElementById('bookmarkSelectElem');

    // create first option for bookmark select tag.
    const firstOption = document.createElement('option');
    firstOption.text = 'select a bookmark folder';
    firstOption.setAttribute('disabled', true);
    firstOption.setAttribute('selected', true);
    firstOption.value = '-1';
    selectElem.add(firstOption);

    for (var i = 0; i < bookmarkFolders.length; i++) {
      const option = document.createElement('option');
      option.value = bookmarkFolders[i].id;
      option.text = bookmarkFolders[i].title + '(' + bookmarkFolders[i].numberOfChildren + ')';
      if (bookmarkFolders[i].numberOfChildren === 0) {
        option.setAttribute('disabled', true);
      }
      selectElem.add(option);
    }
  },
  GetBookmarkFolders: bookmarkTree => {
    if (bookmarkTree.children) {
      bookmarkTree.children.forEach(function(node) {
        if (node.children) {
          bookmarkFolders.push({title: node.title, id: node.id, numberOfChildren: node.children.length});
          UI.GetBookmarkFolders(node);
        }
      });
    }
  },
  InitializeBookMark: config => {
    const bookmarkSelectElem = document.querySelector('#bookmarkSelectElem');
    document.querySelector('input[type="radio"][value="' + config.bookmarksState + '"]').checked = true;

    if (config.bookmarksState === false) {
      bookmarkSelectElem.style.display = 'none';
      config.bookmarkFolderId = -1;
      localStorage.setItem('config', JSON.stringify(config));
      const bookmarksElem = document.querySelector('.bookmarks');
      UI.ClearAllChilds(bookmarksElem);
      document.getElementById('bookmarksTitle').style.display = 'none';
    }
    else {
      bookmarkFolders = [];
      UI.ClearAllChilds(bookmarkSelectElem);
      document.getElementById('bookmarksTitle').style.display = 'block';
      bookmarkSelectElem.style.display = 'block';
      chrome.bookmarks.getTree(function(bookmarkTreeAsArray) {
        const bookmarkTree = bookmarkTreeAsArray[0];
        UI.GetBookmarkFolders(bookmarkTree);
        UI.FillBookmarks(bookmarkFolders);
        document.querySelector('option[value="' + config.bookmarkFolderId.toString() + '"]').selected = true;
        if (config.bookmarkFolderId !== -1) {
          UI.CreateBookmarks(config);
        }
      });
    }
  },
  InitializeRecent: config => {
    document.getElementById('recentMode').querySelector('input[type="radio"][value="' + config.recentState + '"]').checked = true;

    if (config.recentState === false) {
      localStorage.setItem('config', JSON.stringify(config));
      const recentElem = document.querySelector('.topSites');
      UI.ClearAllChilds(recentElem);
      document.getElementById('recentsTitle').style.display = 'none';
    }
    else {
      // get chrome top Sites
    const topSitesElem = document.querySelector('.topSites');
      UI.ClearAllChilds(topSitesElem);
      document.getElementById('recentsTitle').style.display = 'block';
    chrome.topSites.get(topSites => {
      let topSitesObj = [];
      topSites.forEach(p => {
        topSitesObj.push({name: p.title, url: p.url})
      });
      UI.PrepareItems(topSitesObj, topSitesElem, false, true);
    });
    }
  },
  InitilizeStartPage: config => {
    document.querySelector('input[type="radio"][value="' + config.wallpaper + '"]').checked = true;
    const container = document.getElementsByClassName('container')[0];

    const colorPaletteElem = document.querySelector('.colorPalette');

    switch (config.wallpaper) {
      case 'default':
        colorPaletteElem.style.display = 'none';
        document.body.style.background = 'url(/content/images/mainBack2.jpg)';
        break;
      case 'solid':
        colorPaletteElem.style.display = 'block';
        document.body.style.background = config.solidColor;
        colorPaletteElem.getElementsByTagName('input')[0].value = config.solidColor;
        break;
      case 'bing':
        Services.BingWallpaper(bingImage => {
        // const img = new Image();
        // img.src = 'http://bing.com' + bingImage;
        // img.addEventListener('load', () => {
          colorPaletteElem.style.display = 'none';
          document.body.style.background = 'url(http://bing.com' + bingImage + ')';
          // const imgData = GetBase64Image(img);
          // localStorage.setItem('wallpaper', imgData);
        // });
        });
        break;
    }
  },
  RemoveTab: target => {
    document.querySelector('.tabs li[data-tab-id="' + parseInt(target.previousSibling.dataset.tabId) + '"]').click();
    target.parentNode.removeChild(target);
    customItems = customItems.filter(obj => obj.tabId !== target.dataset.tabId);
    config.tabs = config.tabs.filter(obj => obj.id.toString() !== target.dataset.tabId);
    localStorage.setItem('customItems', JSON.stringify(customItems));
    localStorage.setItem('config', JSON.stringify(config));
  },
  CreateTab: (tab, index) => {
    const tabsElem = document.querySelector('.tabs');
    const tabItemElem = document.createElement('li');
    const tabItemLinkElem = document.createElement('a');
    tabItemElem.dataset.panelId = 'panel' + index;
    tabItemElem.dataset.tabId = tab.id;
    tabItemLinkElem.innerText = tab.name;
    tabItemLinkElem.title = tab.name;

    if (tab.id !== 0) {
      const tabCloseElem = document.createElement('span');
      tabCloseElem.className = 'icon-cancel tab-close';
      tabItemElem.appendChild(tabCloseElem);
    }
    tabItemElem.appendChild(tabItemLinkElem);

    const btnAddTab = document.getElementById('btnAddTab');
    tabsElem.insertBefore(tabItemElem, btnAddTab);

    if (index !== 0) {
      // insert panel container.
      const panelContainer = document.querySelector('.panelContainer');
      const newPanel = document.createElement('div');
      newPanel.className = 'panel tabItems';
      newPanel.id = 'panel' + index;

      // create new tab btn.
      const btnNewSiteItem = document.createElement('div');
      btnNewSiteItem.className = 'item newSiteItem';

      const iconPlusElem = document.createElement('span');
      iconPlusElem.className = 'item-name icon-plus';

      const itemUrlElem = document.createElement('span');
      itemUrlElem.className = 'item-url';
      itemUrlElem.innerText = 'Add a Site';

      btnNewSiteItem.appendChild(iconPlusElem);
      btnNewSiteItem.appendChild(itemUrlElem);

      newPanel.appendChild(btnNewSiteItem);

      panelContainer.appendChild(newPanel);
    }

    return tabItemElem;
  }
};
