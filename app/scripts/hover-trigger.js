'use strict';

define('hover-trigger', ['jquery'], function($) {
    return {
        handle: function(body, content, selector, getId) {
            body = $(body);
            body.on('mouseenter', selector, function() {
                chrome.runtime.sendMessage({ msg: 'hover', content: content, id: getId.call(this) });
            });
            body.on('mouseleave', selector, function() {
                clearTimeout($(this).data('hovercards-timeout'));
                chrome.runtime.sendMessage({ msg: 'unhover' });
            });
            body.on('mousedown', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                $(this).data('hovercards-timeout', setTimeout(function() {
                    chrome.runtime.sendMessage({ msg: 'activate', content: content, id: getId.call(this) });
                }, 333));
            });
            body.on('click', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                clearTimeout($(this).data('hovercards-timeout'));
            });
        }
    };
});
