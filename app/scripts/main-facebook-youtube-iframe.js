'use strict';

require(['youtube-video', 'injector'], function(youtubeVideo, injector) {
    youtubeVideo.registerInjections();
    injector.inject('facebook-youtube-iframe');
});
