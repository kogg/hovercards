'use strict';

require(['sidebar-directive',
         'content-directive',
         'youtube-video-card-directive',
         'youtube-channel-subscribe-directive',
         'readmore-directive',
         'htmlify-filter',
         'numsmall-filter',
         'readmore-directive',
         'slide-animation'], function() {
    angular.bootstrap(document, ['app']);
});

require(['jquery'], function($) {
    /* jshint unused:false */
    require(['hotkey']);
});
