'use strict';

define('notifications-background', [], function() {
    var notificationsBackground = {
        init: function notificationsBackgroundInit() {
            chrome.storage.sync.clear();
            chrome.runtime.onMessage.addListener(function(request, sender) {
                var tabId = sender.tab.id;
                switch (request.msg) {
                    case 'hover':
                        notificationsBackground.sendNotification(tabId, request.provider, request.content);
                        break;
                    case 'loaded':
                        notificationsBackground.sendNotification(tabId, 'hovercards', 'loaded');
                        break;
                }
            });
        },
        sendNotification: function sendNotification(tabId, type, instance) {
            chrome.storage.sync.get(type + '-' + instance, function(storage) {
                if (storage[type + '-' + instance]) {
                    return;
                }
                chrome.tabs.sendMessage(tabId, { msg: 'notify', type: type, instance: instance });
                storage[type + '-' + instance] = true;
                chrome.storage.sync.set(storage);
            });
        }
    };

    return notificationsBackground;
});
