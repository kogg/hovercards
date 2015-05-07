var $            = require('jquery');
var network_urls = require('YoCardsApiCalls/network-urls');

var offset = { top: 32, left: 8 };

module.exports = function(body, selector, get_url) {
    body = $(body);

    body.on('mousemove', selector, function () {
        var obj = $(this);
        var trigger;
        if (obj.data('yo-trigger')) {
            trigger = obj.data('yo-trigger');
            clearTimeout(trigger.data('yo-trigger-timeout'));
            trigger.data('yo-trigger-timeout', setTimeout(function() {
                trigger.addClass('yo-notify-exit');
            }, 3000));
            return;
        }

        var url = get_url(obj);
        if (!url) {
            return;
        }

        var identity = network_urls(url);
        if (!identity) {
            return;
        }

        var obj_offset = obj.offset();

        obj.data('yo-trigger', trigger = $('<div class="yo-notify yo-notify-embedded"></div>')
            .appendTo(body)
            .addClass('yo-notify-' + identity.api)
            .offset({ top: obj_offset.top + offset.top, left: obj_offset.left + offset.left })
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
        }, 3000));
    });

    body.on('mouseleave', selector, function (e) {
        var obj = $(this);
        if (!obj.data('yo-trigger')) {
            return;
        }
        var trigger = obj.data('yo-trigger');
        var to_element = e.toElement || e.relatedTarget;
        if (trigger.is(to_element) || trigger.find(to_element).length) {
            return;
        }
        clearTimeout(trigger.data('yo-trigger-timeout'));
        trigger.removeData('yo-trigger-timeout');
        trigger.addClass('yo-notify-exit');
    });
};
