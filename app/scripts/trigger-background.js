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
                    break;
                case 'unhover':
                    tabState.maybe = null;
                    break;
                case 'activate':
                    var current = (request.content && { content: request.content, id: request.id }) || tabState.maybe;
                    tabState.maybe = null;
                    if (!current || (tabState.sent && tabState.sent.content === current.content && tabState.sent.id === current.id)) {
                        chrome.tabs.sendMessage(tabId, { msg: 'hide' });
                        current = null;
                    } else {
                        chrome.tabs.sendMessage(tabId, { msg: 'load', content: current.content, id: current.id });
                    }
                    tabState.sent = current;
                    break;
            }
        });
    };
});
