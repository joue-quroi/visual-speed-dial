'use strict';
// this function get item collection and return html item collection
function CreateItems(itemCollection, randomColor) {
  const _htmlItemCollection = [];

  Object.defineProperty(this, 'GetItems', {
    get: () => {
      for (var item in itemCollection) {
        const itemElem = document.createElement('a');
        itemElem.className = 'item';
        itemElem.dataset.url = itemCollection[item].url;
        // if (itemCollection[item].tabId) {
        //   itemElem.dataset.tabId = itemCollection[item].tabId;
        // }
        itemElem.dataset.sortorder = itemCollection[item].sortorder;
        if (itemCollection[item].url.includes('http')) {
          itemElem.setAttribute('href', itemCollection[item].url);
        }
        else {
          itemElem.setAttribute('href', 'http://' + itemCollection[item].url);
        }

        if (itemCollection[item].img) {
          debugger;
          itemElem.style.background = '#' + RandomColor.Get + ' url(' + itemCollection[item].img + ')';
        }
        else {
          itemElem.style.backgroundColor = '#' + itemCollection[item].background;
        }

        if (randomColor === true) {
          itemElem.style.backgroundColor = '#' + RandomColor.Get;
        }

        const nameElem = document.createElement('span');
        nameElem.className = 'item-name';
        nameElem.title = itemCollection[item].name;
        nameElem.innerText = itemCollection[item].name;

        const urlElem = document.createElement('span');
        urlElem.className = 'item-url';
        urlElem.innerText = itemCollection[item].url;
        urlElem.setAttribute('title', itemCollection[item].url);

        const itemOperationsElem = document.createElement('div');
        itemOperationsElem.className = 'item-operations';

        const editElem = document.createElement('span');
        editElem.className = 'icon-pencil item-edit';

        const removeElem = document.createElement('span');
        removeElem.className = 'icon-cancel item-remove';

        itemOperationsElem.appendChild(removeElem);
        itemOperationsElem.appendChild(editElem);

        itemElem.appendChild(nameElem);
        itemElem.appendChild(urlElem);
        itemElem.appendChild(itemOperationsElem);
        _htmlItemCollection.push(itemElem);
      }
      return _htmlItemCollection;
    }
  });
}
