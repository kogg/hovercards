'use strict';

/* FIXME Why do we have to name this within the file itself? */
define('sidebar-inject', ['jquery'], function($) {
    function injectSidebar(body) {
        var obj = $('<div class="hovertoast-sidebar"></div>')
            .css('display', 'none')
            .appendTo(body);
        $('<iframe></iframe>')
            .prop('src', chrome.extension.getURL('sidebar.html'))
            .prop('frameborder', '0')
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
    }

    function inject(context, body) {
        if (!body) {
            body = 'body';
        }
        body = $(body);
        switch (context) {
            case 'default':
                inject.injectSidebar(body);
                break;
        }
    }
    inject.injectSidebar = injectSidebar;

    return inject;
});
