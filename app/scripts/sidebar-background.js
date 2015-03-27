'use strict';

define([], function() {
    return function sidebarBackground() {
        var state = {};
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (!state[sender.tab.id]) {
                state[sender.tab.id] = { deck: [] };
            }
            var tabState = state[sender.tab.id];
            switch (request.msg) {
                case 'deck':
                    tabState.deck.push({ content: request.content, id: request.id });
                    break;
                case 'undodeck':
                    tabState.deck.pop();
                    break;
                case 'undeck':
                    if (tabState.deck.length && tabState.current &&
                        tabState.deck[tabState.deck.length - 1].content === tabState.current.content &&
                        tabState.deck[tabState.deck.length - 1].id      === tabState.current.id) {
                        tabState.deck.length = 0;
                    }
                    if (tabState.deck.length) {
                        tabState.current = tabState.deck[tabState.deck.length - 1];
                        tabState.deck.length = 0;
                        chrome.tabs.sendMessage(sender.tab.id, { msg: 'load', content: tabState.current.content, id: tabState.current.id });
                        tabState.showing = true;
                        return;
                    }
                    if (!tabState.current) {
                        return;
                    }
                    if (tabState.showing) {
                        chrome.tabs.sendMessage(sender.tab.id, { msg: 'hide' });
                    } else {
                        chrome.tabs.sendMessage(sender.tab.id, { msg: 'show' });
                    }
                    tabState.showing = !tabState.showing;
                    break;
            }
        });

        chrome.tabs.onRemoved.addListener(function(tabId) {
            state[tabId] = null;
        });

        chrome.tabs.onUpdated.addListener(function(tabId) {
            state[tabId] = null;
        });
    };
});
