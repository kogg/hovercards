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
                                                    path:  { '19': 'images/omni-' + request.provider + '-19.png',
                                                             '38': 'images/omni-' + request.provider + '-38.png' } });
                        break;
                    case 'unhover':
                        chrome.pageAction.setIcon({ tabId: tabId,
                                                    path:  { '19': 'images/omni-default-19.png',
                                                             '38': 'images/omni-default-38.png' } });
                        break;
                }
            });
        }
    };
});
