require('./service-background')();

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, { code: 'window.top.postMessage({ msg: \'activate\', url: \'' + tab.url + '\' }, \'*\');' });
});
