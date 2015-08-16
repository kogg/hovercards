var $ = require('jquery');

var common       = require('./common');
var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');
var TIMEOUT_BEFORE_TRIGGER = 150;
var TIMEOUT_BEFORE_FADEOUT = 3000;

module.exports = function(selector, get_url, get_offset) {
    $('html').on('mousemove mouseenter', selector, function(e) {
        var obj = $(this);
        var url;
        var identity;
        if (obj.data(EXTENSION_ID + '-clickable-yo') || obj.data(EXTENSION_ID + '-clickable-yo-children') || !(url = common.massage_url(get_url(obj))) || !(identity = network_urls.identify(url))) {
            return;
        }

        obj.trigger(EXTENSION_ID + '-clickable-yo-child');
        obj.parents().each(function() {
            $(this).data(EXTENSION_ID + '-clickable-yo-children', ($(this).data(EXTENSION_ID + '-clickable-yo-children') || 0) + 1);
        });

        function before_trigger(e) {
            function before_trigger_move(e) {
                last_mousemove = e;
                clearTimeout(timeout);
                timeout = setTimeout(before_trigger_next, TIMEOUT_BEFORE_TRIGGER);
            }

            function before_trigger_next() {
                before_trigger_clean();
                during_trigger(last_mousemove);
            }

            function before_trigger_stop() {
                before_trigger_clean();
                obj.parents().each(function() {
                    $(this).data(EXTENSION_ID + '-clickable-yo-children', ($(this).data(EXTENSION_ID + '-clickable-yo-children') || 0) - 1);
                });
            }

            function before_trigger_clean() {
                clearTimeout(timeout);
                obj
                    .removeData(EXTENSION_ID + '-clickable-yo')
                    .off('mousemove mouseenter', before_trigger_move)
                    .off('mouseleave', before_trigger_stop)
                    .off(EXTENSION_ID + '-clickable-yo-child', before_trigger_stop);
            }

            var timeout = setTimeout(before_trigger_next, TIMEOUT_BEFORE_TRIGGER);
            var last_mousemove = e;

            obj
                .data(EXTENSION_ID + '-clickable-yo', 'before_trigger')
                .on('mousemove mouseenter', before_trigger_move)
                .on('mouseleave', before_trigger_stop)
                .on(EXTENSION_ID + '-clickable-yo-child', before_trigger_stop);
        }

        function during_trigger(e) {
            function during_trigger_timeout() {
                trigger.addClass(EXTENSION_ID + '-clickable-yo-trigger-timeout');
            }

            function during_trigger_trigger_click(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                during_trigger_stopping();
                trigger
                    .trigger(EXTENSION_ID + '-clickable-yo', [url])
                    .addClass(EXTENSION_ID + '-clickable-yo-trigger-clicked');
            }

            function during_trigger_trigger_mousemove() {
                trigger
                    .removeClass(EXTENSION_ID + '-clickable-yo-trigger-hide')
                    .removeClass(EXTENSION_ID + '-clickable-yo-trigger-timeout');
                clearTimeout(timeout);
            }

            function during_trigger_obj_mousemove() {
                during_trigger_trigger_mousemove();
                timeout = setTimeout(during_trigger_timeout, TIMEOUT_BEFORE_FADEOUT);
            }

            function during_trigger_mouseleave(e) {
                var to = $(e.toElement);
                if (obj.is(to) || trigger.is(to) || $.contains(obj[0], to[0]) || $.contains(trigger[0], to[0])) {
                    return;
                }
                during_trigger_stop();
            }

            function during_trigger_animation_end(e) {
                switch (e.originalEvent.animationName) {
                    case EXTENSION_ID + '-clickable-yo-trigger-grow':
                        during_trigger_stop();
                        break;
                    case EXTENSION_ID + '-clickable-yo-trigger-fadeout':
                        trigger.addClass(EXTENSION_ID + '-clickable-yo-trigger-hide');
                        break;
                }
            }

            function during_trigger_stopping() {
                clearTimeout(timeout);
                trigger
                    .off('click', during_trigger_trigger_click)
                    .off('mousemove mouseenter', during_trigger_trigger_mousemove)
                    .off('mouseleave', during_trigger_mouseleave);
                obj
                    .off('click', during_trigger_stop)
                    .off('mousemove mouseenter', during_trigger_obj_mousemove)
                    .off('mouseleave', during_trigger_mouseleave)
                    .off(EXTENSION_ID + '-clickable-yo-child', during_trigger_stop);
            }

            function during_trigger_stop() {
                clearTimeout(timeout);
                obj.removeData(EXTENSION_ID + '-clickable-yo');
                during_trigger_stopping();
                trigger.remove();
                obj.parents().each(function() {
                    $(this).data(EXTENSION_ID + '-clickable-yo-children', ($(this).data(EXTENSION_ID + '-clickable-yo-children') || 0) - 1);
                });
            }

            var timeout = setTimeout(during_trigger_timeout, TIMEOUT_BEFORE_FADEOUT);

            var trigger = $('<div><div class="'+ EXTENSION_ID + '-image-hidden"><img class="hovercardsyopoppywhite" src="' + chrome.extension.getURL('images/yopoppy.png') + '"><img class="hovercardsyopoppyreddit" src="' + chrome.extension.getURL('images/yopoppyreddit.png') + '"><img class="hovercardsyopoppyimgur" src="' + chrome.extension.getURL('images/yopoppyimgur.png') + '"></div></div>')
                .appendTo(document.location.protocol === 'chrome-extension:' ? 'body' : 'html')
                .addClass(EXTENSION_ID + '-clickable-yo-trigger')
                .addClass(EXTENSION_ID + '-clickable-yo-trigger-' + identity.api);
            trigger
                .offset(get_offset ? get_offset(obj, trigger, e, url) : obj.offset())
                .on('click', during_trigger_trigger_click)
                .on('mousemove mouseenter', during_trigger_trigger_mousemove)
                .on('mouseleave', during_trigger_mouseleave)
                .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', during_trigger_animation_end);

            obj
                .data(EXTENSION_ID + '-clickable-yo', 'during_trigger')
                .on('click', during_trigger_stop)
                .on('mousemove mouseenter', during_trigger_obj_mousemove)
                .on('mouseleave', during_trigger_mouseleave)
                .on(EXTENSION_ID + '-clickable-yo-child', during_trigger_stop);
        }

        before_trigger(e);
    });
};
