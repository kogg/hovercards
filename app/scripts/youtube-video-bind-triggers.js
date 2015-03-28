'use strict';

define('youtube-video-bind-triggers', ['jquery', 'purl', 'hover-trigger'], function($, purl, hoverTrigger) {
    return function(body) {
        hoverTrigger.handle(body, 'youtube-video', 'a[href*="youtube.com/watch"]', function() {
            var link = $(this);
            return purl(link.attr('href')).param('v');
        });
    };
});
