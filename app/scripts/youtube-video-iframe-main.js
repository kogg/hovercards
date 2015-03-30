'use strict';

require(['hover-trigger'], function(hoverTrigger) {
    hoverTrigger.handle('body', 'youtube-video', '#player .html5-video-container', function() {
        /* globals purl:true */
        return purl(document.URL).segment(-1);
    });
});

require(['youtube-video-bind-triggers'], function(youtubeVideoBindTriggers) {
    youtubeVideoBindTriggers('#player .html5-info-bar');
});
