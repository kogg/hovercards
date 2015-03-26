'use strict';

require(['sidebar-directive',
         'youtube-video-card-directive',
         'youtube-channel-card-directive',
         'youtube-channel-subscribe-directive',
         'youtube-comments-card-directive'], function() {
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
