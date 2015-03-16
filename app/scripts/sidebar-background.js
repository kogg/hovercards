'use strict';

define(function() {
    return function() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            switch (request.msg) {
                case 'triggered':
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'maybe' });
                    break;
                case 'untriggered':
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'maybenot' });
                    break;
                case 'interested':
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'on' });
                    break;
            }
        });
    };
});
