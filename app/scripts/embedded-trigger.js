var $                 = require('jquery');
var longpress_trigger = require('./longpress-trigger');

exports.on = function(body, selector, get_url, fullscreenable) {
    body = $(body);
    var trigger = exports.trigger;
    if (!exports.trigger) { // FIXME I don't like this at all
        trigger = exports.trigger = $('<div class="hovercards-embedded-trigger"></div>').appendTo(body);
        trigger.hide();
        trigger.mouseenter(function() {
            trigger.show();
        });
        trigger.mouseleave(function(e) {
            var to_element = e.toElement || e.relatedTarget;
            if (to_element) { // TODO Unit Test this
                to_element = $(to_element);
                var obj = trigger.data('hovercards-obj'); // FIXME I REALLY DON'T LIKE THIS
                if (obj.is(to_element) || obj.find(to_element).length) {
                    return;
                }
            }
            trigger.hide();
        });
        trigger.click(function() {
            chrome.runtime.sendMessage({ msg: 'activate', url: trigger.data('hovercards-url') });
        });
        longpress_trigger.on(body, 'div.hovercards-embedded-trigger', function() {
            return trigger.data('hovercards-url');
        });
    }
    body.on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', selector, function() {
        if (exports.is_fullscreen($(this))) {
            trigger.show();
            trigger.offset(exports.offset);
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
        trigger.show();
        var obj_offset = obj.offset();
        trigger.offset({ top: obj_offset.top + exports.offset.top, left: obj_offset.left + exports.offset.left });
        trigger.data('hovercards-url', url);
        trigger.data('hovercards-obj', obj); // FIXME I REALLY DON'T LIKE THIS
        if (fullscreenable) {
            trigger.addClass('hovercards-embedded-trigger-fullscreenable');
        } else {
            trigger.removeClass('hovercards-embedded-trigger-fullscreenable');
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

exports.is_fullscreen = function(element) {
    var dom = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
    return dom && element.is(dom);
};

exports.offset = { top: 30, left: 0 };
