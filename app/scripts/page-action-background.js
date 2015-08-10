var _ = require('underscore');

var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = function() {
    chrome.pageAction.onClicked.addListener(function(tab) {
        chrome.tabs.executeScript(tab.id, { code: 'window.top.postMessage({ msg: \'' + EXTENSION_ID + '-activate\', by: \'carlito\', url: \'' + tab.url + '\' }, \'*\');' });
    });

    var sizes = ['19', '38'];
    var carlito_paths = _.chain(sizes).map(function(size) { return [size, 'images/yocards-logo-' + size + '.png']; }).object().value();
    var yo_paths      = _.chain(sizes).map(function(size) { return [size, 'images/yocards-logo-' + size + '-yo.png']; }).object().value();

    chrome.runtime.onMessage.addListener(function(message, sender) {
        if (message.type !== 'url-change') {
            return;
        }
        if (network_urls.identify(message.msg)) {
            chrome.pageAction.show(sender.tab.id);
        } else {
            chrome.pageAction.hide(sender.tab.id);
        }
    });

    chrome.runtime.onMessage.addListener(function(message, sender) {
        if (message.type !== 'activated') {
            return;
        }
        chrome.pageAction.setIcon({ path: message.carlito ? carlito_paths : yo_paths, tabId: sender.tab.id });
    });
};
