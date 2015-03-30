'use strict';

define('youtube-video-bind-triggers-on-player', ['jquery', 'hover-trigger'], function($, hoverTrigger) {
    return function(body, ID) {
        body = $(body);
        hoverTrigger.handle(body, 'youtube-video', '#player .html5-video-container', function() {
            return ID;
        });
    };
});
