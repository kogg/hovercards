'use strict';

define('youtube-video-bind-triggers', ['jquery', 'hover-trigger', 'youtube-video-bind-triggers-on-player'],
    function($, hoverTrigger, youtubeVideoBindTriggersOnPlayer) {
        return {
            on: function youtubeVideoBindTriggersOn(body, docURL) {
                body = $(body);
                /* globals purl:true */
                var doc = purl(docURL || document.URL);
                hoverTrigger.on(body, 'youtube', 'video', 'a[href*="youtube.com/watch"]', function() {
                    return purl($(this).attr('href')).param('v');
                });
                hoverTrigger.on(body, 'youtube', 'video', 'a[data-href*="youtube.com/watch"]', function() {
                    return purl($(this).data('href')).param('v');
                });
                if (doc.attr('host') === 'www.youtube.com') {
                    hoverTrigger.on(body, 'youtube', 'video', 'a[href*="/watch"]', function() {
                        return purl($(this).attr('href')).param('v');
                    });
                    if (doc.attr('path') === '/watch') {
                        youtubeVideoBindTriggersOnPlayer.on(body, doc.param('v'));
                    }
                }
                hoverTrigger.on(body, 'youtube', 'video', 'a[href*="youtu.be/"]', function() {
                    return purl($(this).prop('href')).segment(-1);
                });
                hoverTrigger.on(body, 'youtube', 'video', 'embed[src*="youtube.com/v/"]', function() {
                    return purl($(this).prop('src')).segment(-1);
                });
                hoverTrigger.on(body, 'youtube', 'video', 'object[data*="youtube.com/v/"]', function() {
                    return purl($(this).prop('data')).segment(-1);
                });
            }
        };
    }
);
