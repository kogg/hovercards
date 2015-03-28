'use strict';

define('trigger-background', [], function() {
    return function triggerBackground() {
        var state = {};
        chrome.runtime.onMessage.addListener(function(request, sender) {
            var tabId = sender.tab.id;
            if (!state[tabId]) {
                state[tabId] = { maybe: null, sent: null };
            }
            var tabState = state[tabId];
            switch (request.msg) {
                case 'hover':
                    tabState.maybe = { content: request.content, id: request.id };
                    var provider = request.content.split('-')[0];
                    if (tabState.ready) {
                        chrome.pageAction.setIcon({ tabId: tabId,
                                                    path:  { '19': 'images/omni-' + provider + '-19.png',
                                                             '38': 'images/omni-' + provider + '-38.png' } });
                    }
                    break;
                case 'unhover':
                    tabState.maybe = null;
                    if (tabState.ready) {
                        chrome.pageAction.setIcon({ tabId: tabId,
                                                    path:  { '19': 'images/omni-default-19.png',
                                                             '38': 'images/omni-default-38.png' } });
                    }
                    break;
                case 'activate':
                    var current = (request.content && { content: request.content, id: request.id }) || tabState.maybe;
                    tabState.maybe = null;
                    if (!current || (tabState.sent && tabState.sent.content === current.content && tabState.sent.id === current.id)) {
                        chrome.tabs.sendMessage(tabId, { msg: 'hide' });
                        current = null;
                    } else if (tabState.ready) {
                        chrome.tabs.sendMessage(tabId, { msg: 'load', content: current.content, id: current.id });
                    }
                    tabState.sent = current;
                    break;
                case 'ready':
                    tabState.ready = true;
                    chrome.pageAction.show(tabId);
                    if (tabState.sent) {
                        chrome.tabs.sendMessage(tabId, { msg: 'load', content: tabState.sent.content, id: tabState.sent.id });
                    }
                    break;
            }
        });

        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
            if (changeInfo.status !== 'loading') {
                return;
            }
            state[tabId] = { maybe: null, sent: null };
        });
    };
});
