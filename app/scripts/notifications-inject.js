'use strict';

define('notifications-inject', [], function() {
    return {
        on: function notificationsInjectOn(body) {
            body = $(body);
            var notifications = $('<div class="hovercards-notifications-container"></div>')
                .appendTo(body);

            chrome.runtime.onMessage.addListener(function(request) {
                if (request.msg !== 'notification') {
                    return;
                }
                var notification = $('<div class="hovercards-notification"></div>')
                    .appendTo(notifications)
                    .append('<div class="hovercards-notification-image hovercards-notification-yt"></div>')
                    .append('<div class="hovercards-notification-text"><p>You just hovered over a Hover Cards Link! <b>Click and hold</b> it, or <b>press shift</b> while hovering over it to activate Hover Cards!</p></div>')
                    .click(function(e) {
                        if (e.which !== 1) {
                            return;
                        }
                        clearTimeout(timeout);
                        $(this).addClass('hovercards-notification-exit-animation');
                    })
                    .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                        if (e.originalEvent.animationName !== 'slide-out-hovercards-notification') {
                            return;
                        }
                        $(this).remove();
                    });

                var timeout = setTimeout(function() {
                    notification.addClass('hovercards-notification-exit-animation');
                }, 15000);
            });
        }
    };
});
