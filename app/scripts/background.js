'use strict';

define('background', function() {
    return function() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            switch (request.msg) {
                case 'info':
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', key: 'display', value: 'visible' });
                    break;
                case 'interest':
                    if (request.key === 'confidence' && request.value === 'unsure') {
                        chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', key: 'display', value: 'unconcerned' });
                    }
                    break;
            }
        });
    };
});
