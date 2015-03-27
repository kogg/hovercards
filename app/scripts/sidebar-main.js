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

require(['jquery'], function($) {
    /* jshint unused:false */
    require(['hotkey']);
});
