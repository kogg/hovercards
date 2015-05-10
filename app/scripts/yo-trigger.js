var $            = require('jquery');
var network_urls = require('YoCardsApiCalls/network-urls');

var extension_id = chrome.i18n.getMessage('@@extension_id');

module.exports = function(body, selector, get_url) {
    body = $(body);

    body.on('mouseenter', selector, function(e) {
        var obj = $(this);
        var trigger;
        if (obj.data(extension_id + '-yo-trigger')) {
            trigger = obj.data(extension_id + '-yo-trigger');
            clearTimeout(trigger.data(extension_id + '-yo-trigger-timeout'));
            trigger.data(extension_id + '-yo-trigger-timeout', setTimeout(function() {
                trigger.addClass(extension_id + '-yo-notify-exit');
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

            obj.data(extension_id + '-yo-trigger', trigger = $('<div></div>')
                .appendTo(body)
                .addClass(extension_id + '-yo-notify')
                .addClass(extension_id + '-yo-notify-' + identity.api)
                .offset({ left: Math.max(4, mouse.x - 8), top: Math.max(4, ((obj.height() <= 40) ? obj.offset().top - 16 : mouse.y - 20)) })
                .click(function() {
                    trigger.trigger('yo', [url]);
                    trigger.addClass(extension_id + '-yo-notify-clicked');
                })
                .mouseenter(function() {
                    clearTimeout(trigger.data(extension_id + '-yo-trigger-timeout'));
                    trigger
                        .removeData(extension_id + '-yo-trigger-timeout')
                        .addClass(extension_id + '-yo-notify-hover')
                        .removeClass(extension_id + '-yo-notify-exit');
                })
                .mouseleave(function() {
                    clearTimeout(trigger.data(extension_id + '-yo-trigger-timeout'));
                    trigger
                        .removeClass(extension_id + '-yo-notify-hover')
                        .data(extension_id + '-yo-trigger-timeout', setTimeout(function() {
                            trigger.addClass(extension_id + '-yo-notify-exit');
                        }, 2000));
                })
                .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                    if (e.originalEvent.animationName !== extension_id + '-yo-notify-fadeout' && e.originalEvent.animationName !== extension_id + '-yo-notify-grow') {
                        return;
                    }
                    clearTimeout(trigger.data(extension_id + '-yo-trigger-timeout'));
                    trigger.remove();
                    obj.removeData(extension_id + '-yo-trigger');
                }));

            trigger.data(extension_id + '-yo-trigger-timeout', setTimeout(function() {
                trigger.addClass(extension_id + '-yo-notify-exit');
            }, 2000));
        }, 500);

        obj.one('mouseleave', function() {
            obj.off('mousemove', get_mouse);
            clearTimeout(create_trigger_timeout);
        });
    });
};
