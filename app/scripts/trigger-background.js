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
                            chrome.tabs.sendMessage(tabId, { msg: 'load', provider: sent.provider, content: sent.content, id: sent.id });
                        });
                        break;
                    case 'hover':
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { maybe: { provider: request.provider, content: request.content, id: request.id } } });
                        break;
                    case 'unhover':
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { maybe: null } });
                        break;
                    case 'activate':
                        chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'maybe' }, function(maybe) {
                            chrome.tabs.sendMessage(tabId, { msg: 'set', value: { maybe: null } });
                            var toSend = (request.provider && { provider: request.provider, content: request.content, id: request.id }) || maybe;
                            chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'sent' }, function(sent) {
                                chrome.tabs.sendMessage(tabId, { msg: 'set', value: { sent: toSend } });
                                if (sent && toSend && sent.provider === toSend.provider && sent.content === toSend.content && sent.id === toSend.id) {
                                    toSend = null;
                                }
                                chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'ready' }, function(ready) {
                                    if (!ready) {
                                        return;
                                    }
                                    if (toSend) {
                                        chrome.tabs.sendMessage(tabId, { msg: 'load', provider: toSend.provider, content: toSend.content, id: toSend.id });
                                    } else {
                                        chrome.tabs.sendMessage(tabId, { msg: 'hide' });
                                    }
                                });
                            });
                        });
                        break;
                    case 'hide':
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { maybe: null } });
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { current: null } });
                        chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'ready' }, function(ready) {
                            if (!ready) {
                                return;
                            }
                            chrome.tabs.sendMessage(tabId, { msg: 'hide' });
                        });
                        break;
                }
                /*
                 * TODO I'll need this stuff for pageAction stuff
                chrome.pageAction.setIcon({ tabId: tabId,
                                            path:  { '19': 'images/omni-' + request.provider + '-19.png',
                                                     '38': 'images/omni-' + request.provider + '-38.png' } });
                chrome.pageAction.setIcon({ tabId: tabId,
                                            path:  { '19': 'images/omni-default-19.png',
                                                     '38': 'images/omni-default-38.png' } });
                chrome.pageAction.show(tabId);
                */
            });
        }
    };
});
