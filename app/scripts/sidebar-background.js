'use strict';

define([], function() {
    return function sidebarBackground() {
        function sendDeck(sender) {
            var deck = stack[sender.tab.id].pop();
            stack[sender.tab.id] = [];
            if (!deck) {
                return;
            }
            chrome.tabs.sendMessage(sender.tab.id, { msg: 'deck', content: deck.content, id: deck.id });
        }

        var timeout;
        var stack = {};

        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (!stack[sender.tab.id]) {
                stack[sender.tab.id] = [];
            }
            switch (request.msg) {
                case 'trigger':
                    stack[sender.tab.id].push({ content: request.content, id: request.id });
                    break;
                case 'untrigger':
                    stack[sender.tab.id].pop();
                    break;
                case 'shoot':
                    sendDeck(sender);
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'undeck' });
                    break;
            }
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                sendDeck(sender);
            }, 500);
        });
    };
});
