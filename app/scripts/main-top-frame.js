'use strict';

require(['sidebar'], function(sidebar) {
    sidebar().appendTo('body');
});
require(['youtube-video', 'injector'], function(youtubeVideo, injector) {
    youtubeVideo.registerInjections();
    injector.inject();
});
