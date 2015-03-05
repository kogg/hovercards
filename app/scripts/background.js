'use strict';

define('background', function() {
    return function() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (request.msg === 'info') {
                if (request.key !== 'uninterested') {
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', key: 'display', value: 'visible' });
                } else {
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', key: 'display', value: 'uninterested' });
                }
            }
        });
    };
});
