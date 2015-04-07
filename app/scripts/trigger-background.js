'use strict';

define('trigger-background', [], function() {
    return {
        init: function triggerBackgroundInit() {
            chrome.runtime.onMessage.addListener(function(request, sender) {
                var tabId = sender.tab.id;
                switch (request.msg) {
                    case 'ready':
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { ready: true } });
                        chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'sent' }, function(url) {
                            if (!url) {
                                return;
                            }
                            chrome.tabs.sendMessage(tabId, { msg: 'load', url: url });
                        });
                        break;
                    case 'activate':
                        chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'sent' }, function(url) {
                            chrome.tabs.sendMessage(tabId, { msg: 'set', value: { sent: request.url } });
                            var msg;
                            if (request.url !== url) {
                                msg = { msg: 'load', url: request.url };
                            } else {
                                msg = { msg: 'hide' };
                            }
                            chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'ready' }, function(ready) {
                                if (!ready) {
                                    return;
                                }
                                chrome.tabs.sendMessage(tabId, msg);
                            });
                        });
                        break;
                    case 'hide':
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { sent: null } });
                        chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'ready' }, function(ready) {
                            if (!ready) {
                                return;
                            }
                            chrome.tabs.sendMessage(tabId, { msg: 'hide' });
                        });
                        break;
                }
            });
        }
    };
});
