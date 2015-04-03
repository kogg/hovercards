'use strict';

require(['sidebar-inject'], function(sidebarInject) {
    sidebarInject.on('body', 'html');
});

require(['youtube-video-bind-triggers'], function(youtubeVideoBindTriggers) {
    youtubeVideoBindTriggers.on('body');
});

require(['state-manager'], function(stateManager) {
    stateManager.init();
});

require(['notifications-inject'], function(notificationsInject) {
    notificationsInject.on('body');
});
