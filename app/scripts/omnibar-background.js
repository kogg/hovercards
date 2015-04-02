'use strict';

// TODO Unit Tests
define('omnibar-background', [], function() {
    return {
        init: function omnibarBackgroundInit() {
            chrome.runtime.onMessage.addListener(function(request, sender) {
                var tabId = sender.tab.id;
                switch (request.msg) {
                    case 'hover':
                        chrome.pageAction.show(tabId);
                        chrome.pageAction.setIcon({ tabId: tabId,
                                                    path:  { '19': 'images/' + request.provider + '-omni-19.png',
                                                             '38': 'images/' + request.provider + '-omni-38.png' } });
                        break;
                    case 'unhover':
                        chrome.pageAction.setIcon({ tabId: tabId,
                                                    path:  { '19': 'images/hovercards-omni-19.png',
                                                             '38': 'images/hovercards-omni-38.png' } });
                        break;
                }
            });
        }
    };
});
