'use strict';

define('hover-trigger', ['jquery'], function($) {
    var hoverTrigger = {
        on: function(body, selector, getURL) {
            body = $(body);
            body.on('mouseleave', selector, function() {
                clearTimeout($(this).data('hovercards-timeout'));
            });
            body.on('mousedown', selector, function(e) {
                if (e.which !== 1) {
                    return;
                }
                var link = $(this);
                link.data('hovercards-timeout', setTimeout(function() {
                    chrome.runtime.sendMessage({ msg: 'activate', url: getURL(link) });
                    link.css('pointer-events', 'none');
                    link.css('cursor', 'default');
                    var interval = setInterval(function() {
                        if (hoverTrigger.isActive(link)) {
                            return;
                        }
                        link.css('pointer-events', '');
                        link.css('cursor', 'auto');
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
