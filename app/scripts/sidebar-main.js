'use strict';

require(['cards-directive',
         'readmore-directive',
         'youtube-channel-subscribe-directive',
         'copy-filter',
         'htmlify-filter',
         'numsmall-filter',
         'trust-resource-url-filter',
         'slide-animation'], function() {
    angular.bootstrap(document, ['app']);
});

require(['hotkey-trigger'], function(hotkeyTrigger) {
    hotkeyTrigger.on('body');
});

require(['domReady!'], function() {
    chrome.runtime.sendMessage({ msg: 'ready' });
});

require(['everywhere-main']);
