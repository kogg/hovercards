'use strict';

define('longpress-trigger', ['jquery'], function($) {
    var longpress_trigger = {
        on: function(body, selector, get_url) {
            body = $(body);
            body.on('mousedown', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                var obj = $(this);
                var url = get_url(obj);
                if (!url) {
                    return;
                }
                var timeout = setTimeout(function() {
                    obj.off('click.longpress_mousedown');
                    obj.off('mouseleave.longpress_mousedown');
                    obj.off('mousemove.longpress_mousedown');
                    obj.trigger('longpress', [url]);
                }, 333);
                obj.one('click.longpress_mousedown', function(e) {
                    if (e.which !== 1) {
                        return;
                    }
                    clearTimeout(timeout);
                });
                obj.one('mouseleave.longpress_mousedown', function() {
                    clearTimeout(timeout);
                });
                obj.one('mousemove.longpress_mousedown', function() {
                    clearTimeout(timeout);
                });
            });
            body.on('longpress', selector, function(e, url) {
                chrome.runtime.sendMessage({ msg: 'activate', url: url });
                var obj = $(this);
                var initialPointerEvents = obj.css('pointer-events');
                var initialCursor = obj.css('cursor');
                obj.css('pointer-events', 'none');
                obj.css('cursor', 'default');

                var interval = setInterval(function() {
                    if (longpress_trigger.isActive(obj)) {
                        return;
                    }
                    clearInterval(interval);
                    obj.off('click.longpress_longpress');
                    obj.css('pointer-events', initialPointerEvents);
                    obj.css('cursor', initialCursor);
                }, 100);
                obj.one('click.longpress_longpress', function(e) {
                    if (e.which !== 1) {
                        return;
                    }
                    e.preventDefault();
                    e.stopImmediatePropagation();
                });
            });
            body.on('mouseenter', selector, function() {
                var obj = $(this);
                var url = get_url(obj);
                if (!url) {
                    return;
                }
                chrome.runtime.sendMessage({ msg: 'hovered' });
            });
        },
        isActive: function(obj) {
            return obj.is(':active');
        }
    };

    return longpress_trigger;
});
