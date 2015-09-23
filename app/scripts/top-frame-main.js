// New Stuff
require('./analytics/top-frame');
require('./modal/top-frame');
/*
var $ = require('jquery');

var network_urls = require('YoCardsApiCalls/network-urls');

var container = $('<div></div>')
    .appendTo('html')
    .addClass(chrome.i18n.getMessage('@@extension_id') + '-container');

require('./sidebar')()
    .appendTo(container);

var url;
// FIXME I don't like any of this
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
            return chrome.runtime.sendMessage({ type: 'page-action', msg: false });
        }
        if (response[1].type in { discussion: true, url: true } && (!response[1].comments || !response[1].comments.length)) {
            return chrome.runtime.sendMessage({ type: 'page-action', msg: false });
        }
        chrome.runtime.sendMessage({ type: 'page-action', msg: true });
    });
}, 500);
*/
