'use strict';

define('notifications-background', [], function() {
    return {
        init: function notificationsBackgroundInit() {
            chrome.storage.sync.clear();
            chrome.runtime.onMessage.addListener(function(request, sender) {
                var tabId = sender.tab.id;
                switch (request.msg) {
                    case 'hover':
                        var storageKey = request.provider + '-' + request.content;
                        chrome.storage.sync.get(storageKey, function(storage) {
                            if (storage[storageKey]) {
                                return;
                            }
                            chrome.tabs.sendMessage(tabId, { msg: 'notify', type: request.provider, instance: request.content });
                            storage[storageKey] = true;
                            chrome.storage.sync.set(storage);
                        });
                        break;
                    case 'loaded':
                        chrome.storage.sync.get('firsttime', function(storage) {
                            if (storage.firsttime) {
                                return;
                            }
                            chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'hasloaded' }, function(hasloaded) {
                                if (hasloaded) {
                                    return;
                                }
                                chrome.tabs.sendMessage(tabId, { msg: 'notify', type: 'hovercards', instance: 'loaded' });
                                chrome.tabs.sendMessage(tabId, { msg: 'set', value: { hasloaded: true } });
                            });
                        });
                        break;
                    case 'hidden':
                        chrome.storage.sync.get('firsttime', function(storage) {
                            if (storage.firsttime) {
                                return;
                            }
                            chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'hasloaded' }, function(hasloaded) {
                                if (!hasloaded) {
                                    return;
                                }
                                chrome.tabs.sendMessage(tabId, { msg: 'notify', type: 'hovercards', instance: 'hidden' });
                                chrome.storage.sync.set({ firsttime: true });
                            });
                        });
                        break;
                }
            });
        }
    };
});
