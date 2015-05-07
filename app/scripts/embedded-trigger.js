var $         = require('jquery');
var common    = require('./common');
var longpress = require('./longpress');

var offset = { top: 32, left: 8 };

module.exports = function(body, selector, get_url, sendMessage, fullscreenable) {
    body = $(body);
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
                sendMessage(trigger.data('hovercards-url'));
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
                .data('hovercards-obj', obj) // FIXME I REALLY DON'T LIKE THIS
                .toggleClass('hovercards-embedded-trigger-fullscreenable', fullscreenable);
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
};
