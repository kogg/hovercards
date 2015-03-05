'use strict';

define('background', function() {
    return function() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (request.msg === 'request-info') {
                chrome.tabs.sendMessage(sender.tab.id, request);
            }
        });
    };
});
