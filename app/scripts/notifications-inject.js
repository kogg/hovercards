'use strict';

define('notifications-inject', [], function() {
    return {
        on: function notificationsInjectOn(body) {
            body = $(body);
        }
    };
});
