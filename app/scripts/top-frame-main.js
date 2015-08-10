var $ = require('jquery');

var container = $('<div></div>')
    .appendTo('html')
    .addClass(chrome.i18n.getMessage('@@extension_id') + '-container');

require('./sidebar')()
    .appendTo(container);

require('./google-analytics')();

var url;
setInterval(function() {
    var new_url = document.URL;
    if (url === new_url) {
        return;
    }
    url = new_url;
    chrome.runtime.sendMessage({ type: 'url-change', msg: url });
}, 500);
