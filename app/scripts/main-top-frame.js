'use strict';

require(['sidebar'], function(sidebar) {
    sidebar().appendTo('body');
});
require(['youtube-video-inject'], function(youtubeVideoInject) {
    youtubeVideoInject('body');
});
