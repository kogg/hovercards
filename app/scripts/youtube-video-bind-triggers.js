'use strict';

define('youtube-video-bind-triggers', ['jquery', 'purl', 'hover-trigger'], function($, purl, hoverTrigger) {
    return function(body) {
        hoverTrigger.handle(body, 'youtube-video', 'a[href*="youtube.com/watch"]', function() {
            return purl($(this).attr('href')).param('v');
        });
        hoverTrigger.handle(body, 'youtube-video', 'embed[src*="youtube.com/v/"]', function() {
            return purl($(this).prop('src')).segment(-1);
        });
        hoverTrigger.handle(body, 'youtube-video', 'object[data*="youtube.com/v/"]', function() {
            return purl($(this).prop('data')).segment(-1);
        });
    };
});
