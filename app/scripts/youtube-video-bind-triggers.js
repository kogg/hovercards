'use strict';

define('youtube-video-bind-triggers', ['jquery', 'hover-trigger', 'youtube-video-bind-triggers-on-player'], function($, hoverTrigger, youtubeVideoBindTriggersOnPlayer) {
    return function(body, docURL) {
        body = $(body);
        docURL = docURL || document.URL;
        hoverTrigger.handle(body, 'youtube-video', 'a[href*="youtube.com/watch"]', function() {
            /* globals purl:true */
            return purl($(this).attr('href')).param('v');
        });
        if (purl(docURL).attr('host') === 'www.youtube.com') {
            hoverTrigger.handle(body, 'youtube-video', 'a[href*="/watch"]', function() {
                /* globals purl:true */
                return purl($(this).attr('href')).param('v');
            });
            if (purl(docURL).attr('path') === '/watch') {
                youtubeVideoBindTriggersOnPlayer(body, purl(docURL).param('v'));
            }
        }
        hoverTrigger.handle(body, 'youtube-video', 'a[href*="youtu.be/"]', function() {
            /* globals purl:true */
            return purl($(this).prop('href')).segment(-1);
        });
        hoverTrigger.handle(body, 'youtube-video', 'embed[src*="youtube.com/v/"]', function() {
            /* globals purl:true */
            return purl($(this).prop('src')).segment(-1);
        });
        hoverTrigger.handle(body, 'youtube-video', 'object[data*="youtube.com/v/"]', function() {
            /* globals purl:true */
            return purl($(this).prop('data')).segment(-1);
        });
    };
});
