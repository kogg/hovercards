'use strict';

define('notifications-inject', [], function() {
    return {
        on: function notificationsInjectOn(body) {
            body = $(body);
            var notifications = $('<div class="hovercards-notifications-container"></div>')
                .appendTo(body);

            chrome.runtime.onMessage.addListener(function(request) {
                switch (request.msg) {
                    case 'notify':
                        var notification = $('<div class="hovercards-notification"></div>')
                            .appendTo(notifications)
                            .data('hovercards-notification-timeout', setTimeout(function() {
                                notification.addClass('hovercards-notification-exit-animation');
                            }, 15000))
                            .click(function(e) {
                                if (e.which !== 1) {
                                    return;
                                }
                                clearTimeout($(this).data('hovercards-notification-timeout'));
                                $(this).addClass('hovercards-notification-exit-animation');
                            })
                            .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                                if (e.originalEvent.animationName !== 'slide-out-hovercards-notification') {
                                    return;
                                }
                                $(this).remove();
                            });

                        $('<div class="hovercards-notification-image"></div>')
                            .appendTo(notification)
                            // FIXME How to get !important on this without... this?
                            .css('cssText', 'background-image: url(' + chrome.extension.getURL('images/' + request.type + '-notification.gif') + ') !important');

                        $('<div class="hovercards-notification-text"><p>You just hovered over a Hover Cards Link! <b>Click and hold</b> it, or <b>press shift</b> while hovering over it to activate Hover Cards!</p></div>')
                            .appendTo(notification);
                        break;
                    case 'load':
                    case 'hide':
                        notifications.children().each(function() {
                            clearTimeout($(this).data('hovercards-notification-timeout'));
                            $(this).addClass('hovercards-notification-exit-animation');
                        });
                        break;
                }
            });
        }
    };
});
