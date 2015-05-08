var $            = require('jquery');
var network_urls = require('YoCardsApiCalls/network-urls');

module.exports = function(body, selector, get_url) {
    body = $(body);

    body.on('mouseenter', selector, function(e) {
        var obj = $(this);
        var trigger;
        if (obj.data('yo-trigger')) {
            trigger = obj.data('yo-trigger');
            clearTimeout(trigger.data('yo-trigger-timeout'));
            trigger.data('yo-trigger-timeout', setTimeout(function() {
                trigger.addClass('yo-notify-exit');
            }, 2000));
            return;
        }

        var url = get_url(obj);
        if (!url) {
            return;
        }

        var identity = network_urls.identify(url);
        if (!identity) {
            return;
        }

        var mouse = { };

        function get_mouse(e) {
            mouse.x = e.pageX;
            mouse.y = e.pageY;
        }

        get_mouse(e);
        obj.on('mousemove', get_mouse);

        var create_trigger_timeout = setTimeout(function() {
            obj.off('mousemove', get_mouse);

            obj.data('yo-trigger', trigger = $('<div class="yo-notify"></div>')
                .appendTo(body)
                .addClass('yo-notify-' + identity.api)
                .offset({ left: Math.max(4, mouse.x - 8), top: Math.max(4, ((obj.height() <= 40) ? obj.offset().top - 16 : mouse.y - 20)) })
                .click(function() {
                    trigger.trigger('yo', [url]);
                    trigger.addClass('yo-notify-clicked');
                })
                .mouseenter(function() {
                    clearTimeout(trigger.data('yo-trigger-timeout'));
                    trigger.removeData('yo-trigger-timeout');
                    trigger.addClass('yo-notify-hover');
                    trigger.removeClass('yo-notify-exit');
                })
                .mouseleave(function() {
                    trigger.removeClass('yo-notify-hover');
                    clearTimeout(trigger.data('yo-trigger-timeout'));
                    trigger.data('yo-trigger-timeout', setTimeout(function() {
                        trigger.addClass('yo-notify-exit');
                    }, 2000));
                })
                .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                    if (e.originalEvent.animationName !== 'yofadeOut' && e.originalEvent.animationName !== 'yohasbeenpressedlol') {
                        return;
                    }
                    clearTimeout(trigger.data('yo-trigger-timeout'));
                    trigger.remove();
                    obj.removeData('yo-trigger');
                }));

            trigger.data('yo-trigger-timeout', setTimeout(function() {
                trigger.addClass('yo-notify-exit');
            }, 2000));
        }, 500);

        obj.one('mouseleave', function() {
            obj.off('mousemove', get_mouse);
            clearTimeout(create_trigger_timeout);
        });
    });
};
