'use strict';

define('hover-trigger', ['jquery'], function($) {
    var hover_trigger = {
        on: function(body, selector, get_url) {
            body = $(body);
            body.on('mousedown', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                var obj = $(this);
                var url = hover_trigger.get_url(get_url(obj));
                if (!url) {
                    return;
                }
                var timeout = setTimeout(function() {
                    obj.off('click.hovercardsmousedown');
                    obj.off('mousedown.hovercardsmousedown');
                    obj.trigger('longpress', [url]);
                }, 333);
                obj.one('click.hovercardsmousedown', function(e) {
                    if (e.which !== 1) {
                        return;
                    }
                    clearTimeout(timeout);
                });
                obj.one('mouseleave.hovercardsmousedown', function() {
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
                    if (hover_trigger.isActive(obj)) {
                        return;
                    }
                    clearInterval(interval);
                    obj.off('click.hovercardslongpress');
                    obj.css('pointer-events', initialPointerEvents);
                    obj.css('cursor', initialCursor);
                }, 100);
                obj.one('click.hovercardslongpress', function(e) {
                    if (e.which !== 1) {
                        return;
                    }
                    e.preventDefault();
                    e.stopImmediatePropagation();
                });
            });
            body.on('mouseenter', selector, function() {
                var obj = $(this);
                var url = hover_trigger.get_url(obj, get_url);
                if (!url) {
                    return;
                }
                chrome.runtime.sendMessage({ msg: 'hovered' });
            });
        },
        get_url: function(url) {
            url = hover_trigger.relative_to_absolute(url);
            if (url.match(/^javascript:.*/)) {
                return null;
            }
            return url;
        },
        relative_to_absolute: function(url) {
            var a = document.createElement('a');
            a.href = url;
            url = a.href;
            a.href = '';
            if (a.remove) {
                a.remove();
            }
            return url;
        },
        isActive: function(obj) {
            return obj.is(':active');
        }
    };

    return hover_trigger;
});
