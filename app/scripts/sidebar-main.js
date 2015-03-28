'use strict';

require(['sidebar-directive',
         'content-directive',
         'readmore-directive',
         'youtube-channel-subscribe-directive',
         'htmlify-filter',
         'numsmall-filter',
         'trust-resource-url-filter',
         'slide-animation'], function() {
    angular.bootstrap(document, ['app']);
});

require(['hotkey-trigger'], function(hotkeyTrigger) {
    hotkeyTrigger.handle('body');
});
