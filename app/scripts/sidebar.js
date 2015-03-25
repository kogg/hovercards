'use strict';

define('sidebar', ['jquery'], function() {
    var sidebar = {};

    function injectSidebar(body) {
        var obj = $('<div class="hovertoast-sidebar"></div>')
            .css('display', 'none')
            .appendTo(body);
        $('<iframe></iframe>')
            .prop('src', chrome.extension.getURL('sidebar.html'))
            .prop('frameborder', '0')
            .appendTo(obj);

        var onDeck = false;
        chrome.runtime.onMessage.addListener(function(request) {
            switch (request.msg) {
                case 'deck':
                    onDeck = true;
                    break;
                case 'undeck':
                    if (onDeck) {
                        obj.show();
                        onDeck = false;
                        break;
                    }
                    obj.toggle(obj.css('display') === 'none');
                    break;
            }
        });

        return obj;
    }
    sidebar.injectSidebar = injectSidebar;

    function inject(context, body) {
        if (!body) {
            body = 'body';
        }
        body = $(body);
        switch (context) {
            case 'default':
                sidebar.injectSidebar(body);
                break;
        }
    }
    sidebar.inject = inject;

    function background() {
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
    }
    sidebar.background = background;

    return sidebar;
});
