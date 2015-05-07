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
            }, 2000));
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
        }, 2000));
    });
    /*
    var trigger = body.find('.hovercards-embedded-trigger');
    if (!trigger.length) { // FIXME I don't like this at all
        trigger = $('<div class="hovercards-embedded-trigger"></div>')
            .appendTo(body)
            .hide()
            .mouseenter(function() {
                trigger.show();
            })
            .mouseleave(function(e) {
                var to_element = e.toElement || e.relatedTarget;
                if (to_element) { // TODO Unit Test this
                    to_element = $(to_element);
                    var obj = trigger.data('hovercards-obj'); // FIXME I REALLY DON'T LIKE THIS
                    if (obj.is(to_element) || obj.find(to_element).length) {
                        return;
                    }
                }
                trigger.hide();
            })
            .click(function() {
                trigger.trigger('yo', [trigger.data('hovercards-url')]);
            });
        longpress(body, 'div.hovercards-embedded-trigger', function() {
            return trigger.data('hovercards-url');
        });
    }
    body.on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', selector, function() {
        if (common.is_fullscreen($(this))) {
            trigger.show();
            trigger.offset(offset);
        } else {
            trigger.hide();
        }
    });
    body.on('mouseenter', selector, function() {
        var obj = $(this);
        var url = get_url(obj);
        if (!url) {
            return;
        }
        if (trigger.is(':hidden')) {
            trigger.show();
            var obj_offset = obj.offset();
            trigger
                .offset({ top: obj_offset.top + offset.top, left: obj_offset.left + offset.left })
                .data('hovercards-url', url)
                .data('hovercards-obj', obj); // FIXME I REALLY DON'T LIKE THIS
        }
    });
    body.on('mouseleave', selector, function(e) {
        var to_element = e.toElement || e.relatedTarget;
        if (to_element) { // TODO Unit Test this
            to_element = $(to_element);
            if (trigger.is(to_element) || trigger.find(to_element).length) {
                return;
            }
        }
        trigger.hide();
    });
    */
};
