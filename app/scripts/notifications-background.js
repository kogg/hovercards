'use strict';

define('notifications-background', [], function() {
    var notificationsBackground = {
        init: function notificationsBackgroundInit() {
            chrome.storage.sync.clear();
            chrome.runtime.onMessage.addListener(function(request, sender) {
                var tabId = sender.tab.id;
                switch (request.msg) {
                    case 'hover':
                        notificationsBackground.sendNotification(tabId, request.content);
                        break;
                }
            });
        },
        sendNotification: function sendNotification(tabId, which) {
            chrome.storage.sync.get(which, function(storage) {
                if (storage[which]) {
                    return;
                }
                chrome.tabs.sendMessage(tabId, { msg: 'notification', which: which });
                storage[which] = true;
                chrome.storage.sync.set(storage);
            });
        }
    };

    return notificationsBackground;
});
