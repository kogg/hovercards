'use strict';

require(['youtube-video-bind-triggers-on-player'], function(youtubeVideoBindTriggersOnPlayer) {
    /* globals purl:true */
    youtubeVideoBindTriggersOnPlayer.on('body', purl(document.URL).segment(-1));
});
