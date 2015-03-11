'use strict';

define(function() {
    return function() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            switch (request.msg) {
                case 'load':
                    chrome.tabs.sendMessage(sender.tab.id, request);
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', visible: true });
                    break;
                case 'interest':
                    switch (request.interested) {
                        case true:
                            chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', visible: true, important: true });
                            break;
                        case null:
                            chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', visible: null });
                            break;
                    }
                    break;
            }
        });
    };
});
