'use strict';

define('notifications-background', [], function() {
    return {
        init: function notificationsBackgroundInit() {
            chrome.runtime.onMessage.addListener(function(request, sender) {
                var tabId = sender.tab.id;
                switch (request.msg) {
                    case 'hover':
                        chrome.tabs.sendMessage(tabId, { msg: 'notification', which: 'firsthover' });
                        break;
                }
            });
        }
    };
});
