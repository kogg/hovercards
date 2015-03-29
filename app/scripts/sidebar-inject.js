'use strict';

define('sidebar-inject', ['jquery'], function($) {
    return function sidebarInject(body) {
        body = $(body);
        var obj = $('<div class="hovertoast-sidebar"></div>')
            .css('display', 'none')
            .appendTo(body);
        $('<iframe></iframe>')
            .prop('src', chrome.extension.getURL('sidebar.html'))
            .prop('frameborder', '0')
            .mouseenter(function() {
                body.css('overflow', 'hidden');
            })
            .mouseleave(function() {
                body.css('overflow', 'auto');
            })
            .appendTo(obj);

        obj.css('right', -obj.width() + 'px');

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
                        .animate({ right: '-340px' }, 400)
                        .hide({ queue: true });
                    break;
            }
        });

        return obj;
    };
});
