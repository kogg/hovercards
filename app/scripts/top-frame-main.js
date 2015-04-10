'use strict';

require(['jquery'], function($) {
    var hovercards_container = $('<div class="hovercards-container"></div>').appendTo('body');

    require(['notifications-inject'], function(notifications_inject) {
        notifications_inject.on(hovercards_container);
    });

    require(['sidebar-inject'], function(sidebar_inject) {
        sidebar_inject.on(hovercards_container, 'body', 'html');
    });
});

require(['state-manager'], function(state_manager) {
    state_manager.init();
});
