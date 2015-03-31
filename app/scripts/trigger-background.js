'use strict';

define('trigger-background', [], function() {
    return {
        init: function triggerBackgroundInit() {
            chrome.runtime.onMessage.addListener(function(request, sender) {
                if (request.msg !== 'hover' && request.msg !== 'unhover' && request.msg !== 'hide' && request.msg !== 'activate' && request.msg !== 'ready') {
                    return;
                }
                var tabId = sender.tab.id;
                chrome.tabs.sendMessage(tabId, { msg: 'getstate' }, function(state) {
                    switch (request.msg) {
                        case 'hide':
                            state.maybe = null;
                            state.sent = null;
                            chrome.tabs.sendMessage(tabId, { msg: 'hide' });
                            break;
                        case 'hover':
                            state.maybe = { provider: request.provider, content: request.content, id: request.id };
                            if (state.ready) {
                                chrome.pageAction.setIcon({ tabId: tabId,
                                                            path:  { '19': 'images/omni-' + request.provider + '-19.png',
                                                                     '38': 'images/omni-' + request.provider + '-38.png' } });
                            }
                            break;
                        case 'unhover':
                            state.maybe = null;
                            if (state.ready) {
                                chrome.pageAction.setIcon({ tabId: tabId,
                                                            path:  { '19': 'images/omni-default-19.png',
                                                                     '38': 'images/omni-default-38.png' } });
                            }
                            break;
                        case 'activate':
                            var current = (request.provider && { provider: request.provider, content: request.content, id: request.id }) || state.maybe;
                            state.maybe = null;
                            if (!current || (state.sent && state.sent.provider === current.provider && state.sent.content === current.content && state.sent.id === current.id)) {
                                chrome.tabs.sendMessage(tabId, { msg: 'hide' });
                                current = null;
                            } else if (state.ready) {
                                chrome.tabs.sendMessage(tabId, { msg: 'load', provider: current.provider, content: current.content, id: current.id });
                            }
                            state.sent = current;
                            break;
                        case 'ready':
                            state.ready = true;
                            chrome.pageAction.show(tabId);
                            if (state.sent) {
                                chrome.tabs.sendMessage(tabId, { msg: 'load', provider: state.sent.provider, content: state.sent.content, id: state.sent.id });
                            }
                            break;
                    }
                    chrome.tabs.sendMessage(tabId, { msg: 'setstate', state: state });
                });
            });
        }
    };
});
