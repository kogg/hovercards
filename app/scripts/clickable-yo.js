var $ = require('jquery');

var common       = require('./common');
var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = function(selector, get_url, get_offset) {
    $('html').on('mousemove', selector, function() {
        var obj = $(this);
        if (obj.data(EXTENSION_ID + '-has-trigger')) {
            return;
        }
        var url = common.massage_url(get_url(obj));
        if (!url) {
            return;
        }
        var identity = network_urls.identify(url);
        if (!identity) {
            return;
        }

        obj.data(EXTENSION_ID + '-has-trigger', true);
        var trigger = $('<div></div>')
            .appendTo('html')
            .addClass(EXTENSION_ID + '-clickable-yo-trigger')
            .addClass(EXTENSION_ID + '-clickable-yo-trigger-' + identity.api)
            .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                switch (e.originalEvent.animationName) {
                    case EXTENSION_ID + '-clickable-yo-grow':
                        kill_trigger();
                        break;
                    case EXTENSION_ID + '-clickable-yo-fadeout':
                        trigger.hide();
                        break;
                }
            });

        var offset;
        if (!get_offset) {
            offset = obj.offset();
        } else {
            offset = get_offset(obj, trigger, url);
        }

        function mouseleave(e) {
            var from = $(this);
            var okay_to = $((from[0] === trigger[0]) ? obj : trigger);
            var to = $(e.toElement);
            if (to.is(okay_to) || $.contains(to, okay_to) || $.contains(okay_to, to)) {
                return;
            }
            kill_trigger();
        }

        function obj_mousemove() {
            trigger
                .show()
                .removeClass(EXTENSION_ID + '-clickable-yo-trigger-timeout');
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                trigger.addClass(EXTENSION_ID + '-clickable-yo-trigger-timeout');
            }, 3000);
        }

        function trigger_mousemove() {
            trigger
                .show()
                .removeClass(EXTENSION_ID + '-clickable-yo-trigger-timeout');
            clearTimeout(timeout);
        }

        function ignore_new_events() {
            clearTimeout(timeout);
            obj
                .off('mouseleave', mouseleave)
                .off('mousemove', obj_mousemove);
            trigger
                .off('mouseleave', mouseleave)
                .off('mousemove', trigger_mousemove);
        }

        function kill_trigger() {
            obj.data(EXTENSION_ID + '-has-trigger', false);
            ignore_new_events();
            trigger.remove();
        }

        var timeout = setTimeout(function() {
            trigger.addClass(EXTENSION_ID + '-clickable-yo-trigger-timeout');
        }, 3000);

        obj
            .on('mouseleave', mouseleave)
            .on('mousemove', obj_mousemove);
        trigger
            .offset({ left: Math.max(0, offset.left), top: Math.max(0, offset.top) })
            .on('mouseleave', mouseleave)
            .on('mousemove', trigger_mousemove)
            .on('click', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                ignore_new_events();
                trigger
                    .trigger(EXTENSION_ID + '-clickable-yo', [url])
                    .addClass(EXTENSION_ID + '-clickable-yo-trigger-clicked');
            });
    });
};
