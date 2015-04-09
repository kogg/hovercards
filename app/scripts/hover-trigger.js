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
                var timeout;
                function cleanup(e) {
                    if (e && e.type === 'click' && e.which !== 1) {
                        return;
                    }
                    clearTimeout(timeout);
                    obj.off('click', cleanup);
                    obj.off('mouseleave', cleanup);
                }
                timeout = setTimeout(function() {
                    obj.trigger('longpress', [url]);
                    cleanup();
                }, 333);
                obj.one('click', cleanup);
                obj.one('mouseleave', cleanup);
            });
            body.on('longpress', selector, function(e, url) {
                chrome.runtime.sendMessage({ msg: 'activate', url: url });
                var obj = $(this);
                var initialPointerEvents = obj.css('pointer-events');
                var initialCursor = obj.css('cursor');
                obj.css('pointer-events', 'none');
                obj.css('cursor', 'default');

                var interval;
                function cleanup(e) {
                    if (e && e.type === 'click') {
                        if (e.which !== 1) {
                            return;
                        }
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                    obj.css('pointer-events', initialPointerEvents);
                    obj.css('cursor', initialCursor);
                    clearInterval(interval);
                    obj.off('click', cleanup);
                    obj.off('mouseleave', cleanup);
                }
                interval = setInterval(function() {
                    if (hover_trigger.isActive(obj)) {
                        return;
                    }
                    cleanup();
                }, 100);
                obj.one('click', cleanup);
                obj.one('mouseleave', cleanup);
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
