'use strict';

define('youtube-video-bind-triggers-on-player', ['jquery', 'hover-trigger'], function($, hoverTrigger) {
    return {
        on: function youtubeVideoBindTriggersOnPlayerOn(body, ID) {
            body = $(body);
            hoverTrigger.on(body, 'youtube', 'youtube-video', '#player .html5-video-container', function() {
                return ID;
            });
        }
    };
});
