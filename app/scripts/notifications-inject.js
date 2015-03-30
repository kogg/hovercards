'use strict';

define('notifications-inject', [], function() {
    return {
        on: function notificationsInjectOn(body) {
            body = $(body);
            chrome.runtime.onMessage.addListener(function(request) {
                if (request.msg !== 'notification') {
                    return;
                }
                $('<div class="hovercards-notification"><h1>LOOK AT ME LOOK AT ME</h1></div>')
                    .appendTo(body)
                    .click(function(e) {
                        if (e.which !== 1) {
                            return;
                        }
                        $(this).addClass('hovercards-notification-exit-animation');
                    })
                    .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                        if (e.originalEvent.animationName !== 'slide-out-hovercards-notification') {
                            return;
                        }
                        $(this).remove();
                    });
            });
        }
    };
});
