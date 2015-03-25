'use strict';

require(['sidebar', 'youtube-video', 'injector'], function(sidebar, youtubeVideo, injector) {
    sidebar.registerInjections();
    youtubeVideo.registerInjections();
    injector.inject();
});
