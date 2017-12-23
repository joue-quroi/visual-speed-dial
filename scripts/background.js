'use strict';

var createProperties = {
  'type':'normal',
  'id': 'SpeedDial',
  'title': 'Add This Page To Speed Dial',
  'contexts': ['page'],
  'documentUrlPatterns': ['*://*/*'],
  'targetUrlPatterns': []
};

chrome.contextMenus.create(createProperties, () => {
  if (!chrome.runtime.lastError) {
    chrome.contextMenus.onClicked.addListener(
      (info, tab) => {
        const currentWindowId = tab.windowId;
        if (localStorage.getItem('customItems')) {
          // parse new site url.
          const url = tab.url;
          let name = '';
          if (url.indexOf('www') !== -1) {
            name = url.substring(url.indexOf('.') + 1, url.lastIndexOf('.'));
          }
          else {
            name = url.substring(url.indexOf('/') + 2, url.lastIndexOf('.'));
          }

          const customItems = JSON.parse(localStorage.getItem('customItems'));

          // check for duplicate site.
          const isDuplicateSite = customItems.filter(item => item.url.toLowerCase() === url.toLowerCase()).length > 0;

          if (isDuplicateSite === true) {
            // document.querySelector('.validationSummery').style.display = 'block';
            const notificationOptions = {
              type:'basic',
              title:'Duplicate url',
              iconUrl:'content/images/24.png',
              message:'The url has already been registered.',
              eventTime:new Date().getTime() + 60 * 1000,
              isClickable:true
            };
            chrome.notifications.create('DuplicateURL', notificationOptions);
            return;
          }

          // screenshot from this table
          chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(data) {
            const width = 300;
            const height = 300;
            const image = new Image();
            image.setAttribute('src', data);
            image.onload = function() {
              const resultData = resizeImg(image, width, height);
              const config = JSON.parse(localStorage.getItem('config'));
              const newSite = [{name: name, url: url, tabId: config.activeTab.toString(), img: resultData}];
              // save new site in custom items object.
              customItems.push(newSite[0]);
              localStorage.setItem('customItems', JSON.stringify(customItems));
            };
          });

        const notificationOptions = {
          type:'basic',
          title:'Success',
          iconUrl:'content/images/24.png',
          message:'The url was successfully registered.',
          eventTime:new Date().getTime() + 60 * 1000,
          isClickable:true
        };
        chrome.notifications.create('SuccessURL', notificationOptions);
      }
      });
  }
});

function resizeImg(img, maxWidth, maxHeight, degrees) {
  var imgWidth = img.width,
    imgHeight = img.height;

  var ratio = 0.2;
  var canvas = document.createElement("canvas");
  var canvasContext = canvas.getContext("2d");
  var canvasCopy = document.createElement("canvas");
  var copyContext = canvasCopy.getContext("2d");
  var canvasCopy2 = document.createElement("canvas");
  var copyContext2 = canvasCopy2.getContext("2d");
  canvasCopy.width = imgWidth;
  canvasCopy.height = imgHeight;
  copyContext.drawImage(img, 0, 0);

  // init
  canvasCopy2.width = imgWidth;
  canvasCopy2.height = imgHeight;
  copyContext2.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvasCopy2.width, canvasCopy2.height);


  var rounds = 1;
  var roundRatio = ratio * rounds;
  for (var i = 1; i <= rounds; i++) {


    // tmp
    canvasCopy.width = imgWidth * roundRatio / i;
    canvasCopy.height = imgHeight * roundRatio / i;

    copyContext.drawImage(canvasCopy2, 0, 0, canvasCopy2.width, canvasCopy2.height, 0, 0, canvasCopy.width, canvasCopy.height);

    // copy back
    canvasCopy2.width = imgWidth * roundRatio / i;
    canvasCopy2.height = imgHeight * roundRatio / i;
    copyContext2.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvasCopy2.width, canvasCopy2.height);

  } // end for

  canvas.width = imgWidth * roundRatio / rounds;
  canvas.height = imgHeight * roundRatio / rounds;
  canvasContext.drawImage(canvasCopy2, 0, 0, canvasCopy2.width, canvasCopy2.height, 0, 0, canvas.width, canvas.height);


  if (degrees == 90 || degrees == 270) {
    canvas.width = canvasCopy2.height;
    canvas.height = canvasCopy2.width;
  } else {
    canvas.width = canvasCopy2.width;
    canvas.height = canvasCopy2.height;
  }

  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  if (degrees == 90 || degrees == 270) {
    canvasContext.translate(canvasCopy2.height / 2, canvasCopy2.width / 2);
  } else {
    canvasContext.translate(canvasCopy2.width / 2, canvasCopy2.height / 2);
  }
  canvasContext.rotate(degrees * Math.PI / 180);
  canvasContext.drawImage(canvasCopy2, -canvasCopy2.width / 2, -canvasCopy2.height / 2);


  var dataURL = canvas.toDataURL();
  return dataURL;
}
