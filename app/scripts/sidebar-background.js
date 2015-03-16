'use strict';

define(function() {
    return function() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            switch (request.msg) {
                case 'triggered':
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', show: 'maybe' });
                    break;
                case 'untriggered':
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', show: 'maybenot' });
                    break;
                case 'interested':
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', show: 'on' });
                    break;
            }
        });
    };
});
