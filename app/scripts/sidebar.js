'use strict';

define('sidebar', ['jquery'], function() {
    var sidebar = {};

    function injectSidebar(body) {
        var obj = $('<div class="hovertoast-sidebar"></div>');
        var iframe = $('<iframe></iframe>')
            .prop('src', chrome.extension.getURL('sidebar.html'))
            .prop('frameborder', '0');
        obj.append(iframe);

        var on = false;
        var onTimeout;

        chrome.runtime.onMessage.addListener(function(request) {
            if (request.msg !== 'sidebar') {
                return;
            }
            switch (request.show) {
                case 'maybe':
                    obj.show();
                    clearTimeout(onTimeout);
                    onTimeout = setTimeout(function() {
                        on = true;
                    }, 2000);
                    break;
                case 'maybenot':
                    if (on) {
                        return;
                    }
                    obj.hide();
                    clearTimeout(onTimeout);
                    break;
                case 'on':
                    obj.show();
                    clearTimeout(onTimeout);
                    on = true;
                    break;
            }
        });

        obj.appendTo(body);

        return obj;
    }
    sidebar.injectSidebar = injectSidebar;

    function inject(context, body) {
        if (!body) {
            body = 'body';
        }
        body = $(body);
        switch (context) {
            case 'default':
                sidebar.injectSidebar(body);
                break;
        }
    }
    sidebar.inject = inject;

    function background() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            switch (request.msg) {
                case 'triggered':
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', show: 'maybe' });
                    break;
                case 'untriggered':
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', show: 'maybenot' });
                    break;
                case 'interested':
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'sidebar', show: 'on' });
                    break;
            }
        });
    }
    sidebar.background = background;

    return sidebar;
});
