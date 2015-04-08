'use strict';

define('hover-trigger', ['jquery'], function($) {
    var hover_trigger = {
        on: function(body, selector, getURL) {
            body = $(body);
            body.on('mousedown', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                var obj = $(this);
                var url = hover_trigger.relative_to_absolute(getURL(obj));
                if (url.match(/^javascript:.*/)) {
                    return;
                }

                var timeout;
                var timed_out = false;
                function clear_timeout() {
                    clearTimeout(timeout);
                }
                function click(e) {
                    if (e.which !== 1) {
                        return;
                    }
                    if (!timed_out) {
                        clear_timeout();
                    } else {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                }
                timeout = setTimeout(function() {
                    timed_out = true;
                    obj.trigger('longpress');
                    obj.off('mouseleave', clear_timeout);
                }, 333);
                obj.one('mouseleave', clear_timeout);
                obj.one('click', click);
            });
            body.on('longpress', selector, function() {
                var obj = $(this);
                var url = hover_trigger.relative_to_absolute(getURL(obj));
                if (url.match(/^javascript:.*/)) {
                    return;
                }
                chrome.runtime.sendMessage({ msg: 'activate', url: url });
                obj.css('pointer-events', 'none');
                obj.css('cursor', 'default');
                var interval = setInterval(function() {
                    if (hover_trigger.isActive(obj)) {
                        return;
                    }
                    obj.css('pointer-events', '');
                    obj.css('cursor', 'auto');
                    clearInterval(interval);
                }, 100);
            });
            body.on('mouseenter', selector, function() {
                var obj = $(this);
                var url = hover_trigger.relative_to_absolute(getURL(obj));
                if (url.match(/^javascript:.*/)) {
                    return;
                }
                chrome.runtime.sendMessage({ msg: 'hovered' });
            });
        },
        isActive: function(obj) {
            return obj.is(':active');
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
        }
    };

    return hover_trigger;
});
