'use strict';

define('hover-trigger', ['jquery'], function($) {
    return {
        handle: function(body, content, selector, getId) {
            body = $(body);
            body.on('mouseenter', selector, function() {
                chrome.runtime.sendMessage({ msg: 'hover', content: content, id: getId.call(this) });
                $(this).data('hovercards-prevent', false);
            });
            body.on('mouseleave', selector, function() {
                chrome.runtime.sendMessage({ msg: 'unhover' });
                clearTimeout($(this).data('hovercards-timeout'));
                $(this).data('hovercards-prevent', false);
            });
            body.on('mousedown', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                var that = this;
                $(this).data('hovercards-timeout', setTimeout(function() {
                    chrome.runtime.sendMessage({ msg: 'activate', content: content, id: getId.call(that) });
                    $(that).data('hovercards-prevent', true);
                }, 333));
                $(this).data('hovercards-prevent', false);
            });
            body.on('click', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                if ($(this).data('hovercards-prevent')) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                clearTimeout($(this).data('hovercards-timeout'));
                $(this).data('hovercards-prevent', false);
            });
        }
    };
});
