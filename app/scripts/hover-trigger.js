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
                var timeout = setTimeout(function() {
                    chrome.runtime.sendMessage({ msg: 'activate', url: getURL(link) });
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
            chrome.storage.sync.get('intro', function(storage) {
                if (storage.intro) {
                    return;
                }
                function mouseenter() {
                    body.off('mouseenter', selector, mouseenter);
                    chrome.storage.sync.get('intro', function(storage) {
                        if (storage.intro) {
                            return;
                        }
                        chrome.runtime.sendMessage({ msg: 'notify', type: 'firsthover' });
                    });
                }
                body.on('mouseenter', selector, mouseenter);
            });
        },
        isActive: function(obj) {
            return obj.is(':active');
        }
    };

    return hover_trigger;
});
