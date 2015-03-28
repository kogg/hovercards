'use strict';

require(['sidebar-inject', 'youtube-video-bind-triggers'], function(sidebarInject, youtubeVideoBindTriggers) {
    sidebarInject('default');
    youtubeVideoBindTriggers('body');
});
