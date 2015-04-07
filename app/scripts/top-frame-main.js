'use strict';

require(['notifications-inject'], function(notifications_inject) {
    notifications_inject.on('body');
});

require(['sidebar-inject'], function(sidebar_inject) {
    sidebar_inject.on('body', 'html');
});

require(['state-manager'], function(state_manager) {
    state_manager.init();
});
