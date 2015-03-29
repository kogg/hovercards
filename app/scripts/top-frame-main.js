'use strict';

require(['sidebar-inject', 'youtube-video-bind-triggers', 'state-manager'], function(sidebarInject, youtubeVideoBindTriggers, stateManager) {
    sidebarInject('body');
    youtubeVideoBindTriggers('body');
    stateManager();
});
