'use strict';

define('notifications-background', [], function() {
    return {
        init: function notificationsBackgroundInit() {
            chrome.storage.sync.clear();
            chrome.runtime.onMessage.addListener(function(request, sender) {
                var tabId = sender.tab.id;
                switch (request.msg) {
                    case 'hover':
                        chrome.storage.sync.get('firsthover', function(storage) {
                            if (storage.firsthover) {
                                return;
                            }
                            chrome.tabs.sendMessage(tabId, { msg: 'notification', which: 'firsthover' });
                        });
                        break;
                }
            });
        }
    };
});
