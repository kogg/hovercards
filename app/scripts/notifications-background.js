'use strict';

define('notifications-background', [], function() {
    return {
        init: function notificationsBackgroundInit() {
            chrome.storage.sync.clear();
            var intro_notifications = { firsthover: true, firsthide: true, firstload: true };
            var intro_count = 0;
            chrome.runtime.onMessage.addListener(function(request, sender) {
                if (request.msg !== 'notify' || !intro_notifications[request.type] || intro_count === 3) {
                    return;
                }
                chrome.storage.sync.get('intro', function(storage) {
                    if (storage.intro) {
                        return;
                    }
                    var tabId = sender.tab.id;
                    intro_notifications[request.type] = false;
                    intro_count++;
                    chrome.tabs.sendMessage(tabId, { msg: 'notify', type: request.type });
                    if (intro_count === 3) {
                        chrome.storage.sync.set({ intro: true });
                    }
                });
            });
        }
    };
});
