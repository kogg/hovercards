'use strict';

define('sidebar', ['jquery'], function($) {
    return function sidebar() {
        var obj = $('<div class="hovertoast-sidebar"></div>');
        var iframe = $('<iframe frameborder="0"></iframe>');
        obj.append(iframe);

        var stayVisible = false;
        var stayVisibleTimeout;

        chrome.runtime.onMessage.addListener(function(request) {
            switch (request.msg) {
                case 'pre-load':
                    iframe.prop('src', chrome.extension.getURL('sidebar.html?' + $.param({ content: request.content, id: request.id })));
                    break;
                case 'sidebar':
                    switch (request.visible) {
                        case true:
                            obj.show();
                            if (request.important) {
                                stayVisible = true;
                                clearTimeout(stayVisibleTimeout);
                            } else {
                                stayVisibleTimeout = setTimeout(function() {
                                    stayVisible = true;
                                }, 2000);
                            }
                            break;
                        case null:
                            if (!stayVisible) {
                                obj.hide();
                                clearTimeout(stayVisibleTimeout);
                            }
                            break;
                    }
                    break;
            }
        });

        return obj;
    };
});
