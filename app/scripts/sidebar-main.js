'use strict';

require(['cards-controller',
         'sidebar-directive',
         'youtube-channel-subscribe-directive',
         'description-filter',
         'numsmall-filter',
         'trust-resource-url-filter',
         'slide-animation'], function() {
    angular.bootstrap(document, ['app']);
});

require(['jquery'], function($) {
    $(document).keydown(function(e) {
        if (e.which !== 16) {
            return;
        }
        chrome.runtime.sendMessage({ msg: 'shoot' });
    });
});
