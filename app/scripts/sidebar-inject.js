'use strict';

define('sidebar-inject', ['jquery'], function($) {
    return function sidebarInject(body) {
        body = $(body)
            .dblclick(function() {
                chrome.runtime.sendMessage({ msg: 'hide' });
            });

        var obj = $('<div class="hovercards-sidebar"></div>')
            .appendTo(body)
            .css('display', 'none');
        obj.css('right', -obj.width() + 'px');

        $('<iframe></iframe>')
            .appendTo(obj)
            .prop('src', chrome.extension.getURL('sidebar.html'))
            .prop('frameborder', '0')
            .mouseenter(function() {
                body.css('overflow', 'hidden');
            })
            .mouseleave(function() {
                body.css('overflow', 'auto');
            });

        $('<div class="hovercards-sidebar-close-button"></div>')
            .appendTo(obj)
            .click(function(e) {
                if (e.which !== 1) {
                    return;
                }
                chrome.runtime.sendMessage({ msg: 'hide' });
            });


        chrome.runtime.onMessage.addListener(function(request) {
            switch (request.msg) {
                case 'load':
                    if (obj.css('display') !== 'none') {
                        return;
                    }
                    obj
                        .finish()
                        .show({ queue: true })
                        .animate({ right: 0 }, 400);
                    break;
                case 'hide':
                    if (obj.css('display') === 'none') {
                        return;
                    }
                    obj
                        .finish()
                        .animate({ right: -obj.width() + 'px' }, 400)
                        .hide({ queue: true });
                    break;
            }
        });

        return obj;
    };
});
