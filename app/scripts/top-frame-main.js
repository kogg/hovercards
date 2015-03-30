'use strict';

require(['sidebar-inject'], function(sidebarInject) {
    sidebarInject.on('body');
});

require(['youtube-video-bind-triggers'], function(youtubeVideoBindTriggers) {
    youtubeVideoBindTriggers.on('body');
});

require(['state-manager'], function(stateManager) {
    stateManager.init();
});
