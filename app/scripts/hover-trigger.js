'use strict';

define('hover-trigger', ['jquery'], function($) {
    var hover_trigger = {
        on: function(body, selector, getURL) {
            body = $(body);
            body.on('mousedown', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                var link = $(this);
                var url = hover_trigger.relative_to_absolute(getURL(link));
                if (url.match(/^javascript:.*/)) {
                    return;
                }
                var timeout = setTimeout(function() {
                    chrome.runtime.sendMessage({ msg: 'activate', url: url });
                    link.css('pointer-events', 'none');
                    link.css('cursor', 'default');
                    var interval = setInterval(function() {
                        if (hover_trigger.isActive(link)) {
                            return;
                        }
                        link.css('pointer-events', '');
                        link.css('cursor', 'auto');
                        clearInterval(interval);
                    }, 100);
                }, 333);
                link.one('mouseleave', function mouseleave() {
                    clearTimeout(timeout);
                });
                link.one('click', function click() {
                    if (e.which !== 1) {
                        return;
                    }
                    clearTimeout(timeout);
                });
            });
            body.on('mouseenter', selector, function() {
                var url = hover_trigger.relative_to_absolute(getURL($(this)));
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
