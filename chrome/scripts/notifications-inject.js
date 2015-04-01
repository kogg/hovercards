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
                                clearTimeout($(this).data('hovercards-notification-timeout'));
                                $(this).hide();
                            });

                        var inner = $('<div class="hovercards-row"></div>')
                            .appendTo(notification);

                        $('<div class="hovercards-notification-image"></div>')
                            .appendTo(inner)
                            // FIXME How to get !important on this without... this?
                            .css('cssText', 'background-image: url(' + chrome.extension.getURL('images/' + request.type + '-notification.gif') + ') !important');

                        var textDiv = $('<div class="hovercards-notification-text"></div>')
                            .appendTo(inner);

                        $('<p></p>')
                            .appendTo(textDiv)
                            .html(function() {
                                if (request.type === 'hovercards') {
                                    return chrome.i18n.getMessage('hovercards_' + request.instance + '_notification');
                                }
                                return chrome.i18n.getMessage('trigger_notification', [chrome.i18n.getMessage(request.type + '_' + request.instance)]);
                            });

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
