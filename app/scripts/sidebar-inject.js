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

        chrome.runtime.onMessage.addListener(function(request) {
            switch (request.msg) {
                case 'load':
                case 'show':
                    obj.show();
                    break;
                case 'hide':
                    obj.hide();
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
