'use strict';

define('background', function() {
    return function() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            switch (request.msg) {
                case 'info':
                    return chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', key: 'display', value: 'visible' });
                case 'interest':
                    if (request.key === 'confidence') {
                        switch (request.value) {
                            case 'sure':
                                return chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', key: 'display', value: 'stay_visible' });
                            case 'unsure':
                                return chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', key: 'display', value: 'unconcerned' });
                        }
                        return;
                    }
                    return;
            }
        });
    };
});
