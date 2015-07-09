var $ = require('jquery');

var common       = require('./common');
var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');
var TIMEOUT_BEFORE_TRIGGER = 300;
var TIMEOUT_BEFORE_FADEOUT = 3000;

module.exports = function(selector, get_url, get_offset) {
    $('html').on('mousemove mouseenter', selector, function() {
        var obj = $(this);
        var url;
        var identity;
        if (obj.data(EXTENSION_ID + '-clickable-yo') || !(url = common.massage_url(get_url(obj))) || !(identity = network_urls.identify(url))) {
            return;
        }

        function before_trigger() {
            function before_trigger_move(e) {
                last_mousemove = e;
                clearTimeout(timeout);
                timeout = setTimeout(before_trigger_next, TIMEOUT_BEFORE_TRIGGER);
            }

            function before_trigger_leave() {
                clearTimeout(timeout);
                before_trigger_stop();
            }

            function before_trigger_next() {
                before_trigger_stop();
                during_trigger(last_mousemove);
            }

            function before_trigger_stop() {
                obj
                    .removeData(EXTENSION_ID + '-clickable-yo')
                    .off('mousemove mouseenter', before_trigger_move)
                    .off('mouseleave', before_trigger_leave);
            }

            var timeout = setTimeout(before_trigger_next, TIMEOUT_BEFORE_TRIGGER);
            var last_mousemove;

            obj
                .data(EXTENSION_ID + '-clickable-yo', 'before_trigger')
                .on('mousemove mouseenter', before_trigger_move)
                .on('mouseleave', before_trigger_leave);
        }

        function during_trigger(e) {
            function during_trigger_timeout() {
                trigger.addClass(EXTENSION_ID + '-clickable-yo-trigger-timeout');
            }

            function during_trigger_trigger_mousemove() {
                trigger
                    .show()
                    .removeClass(EXTENSION_ID + '-clickable-yo-trigger-timeout');
                clearTimeout(timeout);
            }

            function during_trigger_obj_mousemove() {
                during_trigger_trigger_mousemove();
                timeout = setTimeout(during_trigger_timeout, TIMEOUT_BEFORE_FADEOUT);
            }

            function during_trigger_mouseleave(e) {
                var from = $(this);
                var okay_to = $((from[0] === trigger[0]) ? obj : trigger);
                var to = $(e.toElement);
                if (to.is(okay_to) || $.contains(to, okay_to) || $.contains(okay_to, to)) {
                    return;
                }
                during_trigger_stop();
            }

            function during_trigger_click(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                during_trigger_stopping();
                trigger
                    .trigger(EXTENSION_ID + '-clickable-yo', [url])
                    .addClass(EXTENSION_ID + '-clickable-yo-trigger-clicked');
            }

            function during_trigger_animation_end(e) {
                switch (e.originalEvent.animationName) {
                    case EXTENSION_ID + '-clickable-yo-trigger-grow':
                        during_trigger_stop();
                        break;
                    case EXTENSION_ID + '-clickable-yo-trigger-fadeout':
                        trigger.hide();
                        break;
                }
            }

            function during_trigger_stopping() {
                clearTimeout(timeout);
                trigger
                    .off('click', during_trigger_click)
                    .off('mousemove mouseenter', during_trigger_trigger_mousemove)
                    .off('mouseleave', during_trigger_mouseleave);
                obj
                    .off('mousemove mouseenter', during_trigger_obj_mousemove)
                    .off('mouseleave', during_trigger_mouseleave);
            }

            function during_trigger_stop() {
                obj.removeData(EXTENSION_ID + '-clickable-yo');
                during_trigger_stopping();
                trigger.remove();
            }

            var timeout = setTimeout(during_trigger_timeout, TIMEOUT_BEFORE_FADEOUT);

            var trigger = $('<div><div class="'+ EXTENSION_ID + '-image-hidden"><img src="chrome-extension://' + EXTENSION_ID + '/images/yopoppy.png"></div></div>')
                .appendTo('html')
                .addClass(EXTENSION_ID + '-clickable-yo-trigger')
                .addClass(EXTENSION_ID + '-clickable-yo-trigger-' + identity.api);
            trigger
                .offset((function() {
                    var offset = get_offset ? get_offset(obj, trigger, e, url) : obj.offset();
                    return { left: Math.max(0, offset.left), top: Math.max(0, offset.top) };
                }()))
                .on('click', during_trigger_click)
                .on('mousemove mouseenter', during_trigger_trigger_mousemove)
                .on('mouseleave', during_trigger_mouseleave)
                .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', during_trigger_animation_end);

            obj
                .data(EXTENSION_ID + '-clickable-yo', 'during_trigger')
                .on('mousemove mouseenter', during_trigger_obj_mousemove)
                .on('mouseleave', during_trigger_mouseleave);
        }

        before_trigger();
    });
};
