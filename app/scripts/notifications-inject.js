'use strict';

define('notifications-inject', [], function() {
    return {
        on: function notificationsInjectOn(body) {
            body = $(body);
            chrome.runtime.onMessage.addListener(function(request) {
                if (request.msg !== 'notification') {
                    return;
                }
                $('<div class="hovercards-notification"></div>')
                    .appendTo(body);
            });
        }
    };
});
