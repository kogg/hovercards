var $ = require('jquery');

var network_urls = require('YoCardsApiCalls/network-urls');

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
    if (network_urls.identify(url)) {
        chrome.runtime.sendMessage({ type: 'page-action', msg: true });
        return;
    }
    chrome.runtime.sendMessage({ type: 'service', request: { api: 'reddit', type: 'url', id: url } }, function(response) {
        if (!response || response[0]) {
            chrome.runtime.sendMessage({ type: 'page-action', msg: false });
            return;
        }
        chrome.runtime.sendMessage({ type: 'page-action', msg: true });
    });
}, 500);
