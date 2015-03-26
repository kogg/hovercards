'use strict';

define([], function() {
    return function sidebarBackground() {
        var state = {};
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (!state[sender.tab.id]) {
                state[sender.tab.id] = {};
            }
            var tabState = state[sender.tab.id];
            switch (request.msg) {
                case 'deck':
                    tabState.deck = { content: request.content, id: request.id };
                    break;
                case 'undeck':
                    var previous = tabState.current;
                    if (tabState.deck) {
                        tabState.current = tabState.deck;
                        tabState.deck = null;
                    }
                    if (!tabState.current) {
                        return;
                    }
                    if (tabState.current !== previous) {
                        chrome.tabs.sendMessage(sender.tab.id, { msg: 'load', content: tabState.current.content, id: tabState.current.id });
                        tabState.showing = true;
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
    };
});
