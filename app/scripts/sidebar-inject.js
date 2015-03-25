'use strict';

define('sidebar-inject', ['jquery'], function($) {
    function injectSidebar(body) {
        var obj = $('<div class="hovertoast-sidebar"></div>')
            .css('display', 'none')
            .appendTo(body);
        $('<iframe></iframe>')
            .prop('src', chrome.extension.getURL('sidebar.html'))
            .prop('frameborder', '0')
            .appendTo(obj);

        var onDeck = false;
        var hasDeck = false;
        chrome.runtime.onMessage.addListener(function(request) {
            switch (request.msg) {
                case 'deck':
                    onDeck = true;
                    break;
                case 'undeck':
                    if (onDeck) {
                        obj.show();
                        onDeck = false;
                        hasDeck = true;
                        break;
                    }
                    if (!hasDeck) {
                        obj.hide();
                        break;
                    }
                    obj.toggle(obj.css('display') === 'none');
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
