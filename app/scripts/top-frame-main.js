'use strict';

require(['sidebar-inject'], function(sidebarInject) {
    sidebarInject('body');
});

require(['youtube-video-bind-triggers'], function(youtubeVideoBindTriggers) {
    youtubeVideoBindTriggers('body');
});

require(['state-manager'], function(stateManager) {
    stateManager();
});
