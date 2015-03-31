'use strict';

define('hover-trigger', ['jquery'], function($) {
    var hoverTrigger = {
        on: function(body, provider, content, selector, getId) {
            body = $(body);
            body.on('mouseenter', selector, function() {
                chrome.runtime.sendMessage({ msg: 'hover', provider: provider, content: content, id: getId.call(this) });
            });
            body.on('mouseleave', selector, function() {
                chrome.runtime.sendMessage({ msg: 'unhover' });
                clearTimeout($(this).data('hovercards-timeout'));
            });
            body.on('mousedown', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                var that = this;
                $(this).data('hovercards-timeout', setTimeout(function() {
                    chrome.runtime.sendMessage({ msg: 'activate', provider: provider, content: content, id: getId.call(that) });
                    $(that).css('pointer-events', 'none');
                    $(that).css('cursor', 'default');
                    var interval = setInterval(function() {
                        if (hoverTrigger.isActive($(that))) {
                            return;
                        }
                        $(that).css('pointer-events', '');
                        $(that).css('cursor', 'auto');
                        clearInterval(interval);
                    }, 100);
                }, 333));
            });
            body.on('click', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                clearTimeout($(this).data('hovercards-timeout'));
            });
        },
        isActive: function(obj) {
            return obj.is(':active');
        }
    };

    return hoverTrigger;
});
