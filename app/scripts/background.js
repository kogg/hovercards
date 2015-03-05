'use strict';

define('background', function() {
    return function() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (request.msg === 'info') {
                chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', key: 'display', value: 'visible' });
            }
        });
    };
});
