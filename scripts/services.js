'use strict';
var Services = {
  BingWallpaper: callback => {
    const requestURL = 'http://noapi.dorparasti.ir/api/scraps/e9baeceb-f353-4703-a84d-c9e3107bd90f';
    const request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.send();
    request.onload = () => {
      if (request.status === 200) {
        var response = JSON.parse(request.responseText);
        callback(response.Paths[0]);
      }
    };
  },
  GetSuggestedList: (query, callback) => {
    const requestURL = 'http://suggestqueries.google.com/complete/search?output=toolbar&q=' + query;
    const request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.send();
    request.onload = () => {
      if (request.status === 200) {
        var suggestedList = request.responseXML.getElementsByTagName('suggestion');
        callback(suggestedList);
      }
    };
  }
};
