require('./service-background')();

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, { code: 'window.top.postMessage({ msg: \'' + EXTENSION_ID + '-activate\', by: \'carlito\', url: \'' + tab.url + '\' }, \'*\');' });
});
