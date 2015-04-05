'use strict';

define('trigger-background', [], function() {
    return {
        init: function triggerBackgroundInit() {
            chrome.runtime.onMessage.addListener(function(request, sender) {
                var tabId = sender.tab.id;
                switch (request.msg) {
                    case 'ready':
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { ready: true } });
                        chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'sent' }, function(sent) {
                            if (!sent) {
                                return;
                            }
                            chrome.tabs.sendMessage(tabId, { msg: 'load', network: sent.network, type: sent.type, id: sent.id });
                        });
                        break;
                    case 'hover':
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { maybe: { network: request.network, type: request.type, id: request.id } } });
                        break;
                    case 'unhover':
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { maybe: null } });
                        break;
                    case 'activate':
                        chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'maybe' }, function(maybe) {
                            chrome.tabs.sendMessage(tabId, { msg: 'set', value: { maybe: null } });
                            var toSend = (request.network && { network: request.network, type: request.type, id: request.id }) || maybe;
                            chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'sent' }, function(sent) {
                                if (sent && toSend && sent.network === toSend.network && sent.type === toSend.type && sent.id === toSend.id) {
                                    toSend = null;
                                }
                                chrome.tabs.sendMessage(tabId, { msg: 'set', value: { sent: toSend } });
                                chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'ready' }, function(ready) {
                                    if (!ready) {
                                        return;
                                    }
                                    if (toSend) {
                                        chrome.tabs.sendMessage(tabId, { msg: 'load', network: toSend.network, type: toSend.type, id: toSend.id });
                                    } else {
                                        chrome.tabs.sendMessage(tabId, { msg: 'hide' });
                                    }
                                });
                            });
                        });
                        break;
                    case 'hide':
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { maybe: null } });
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
