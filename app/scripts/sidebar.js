'use strict';

define('sidebar', ['jquery'], function($) {
    return function sidebar() {
        var obj = $('<div class="deckard-sidebar"></div>');
        var iframe = $('<iframe frameborder="0"></iframe>');
        obj.append(iframe);

        var stayVisible = false;
        var stayVisibleTimeout;

        chrome.runtime.onMessage.addListener(function(request) {
            if (request.msg === 'sidebar' && request.key === 'display') {
                switch (request.value) {
                    case 'stay_visible':
                        obj.show();
                        iframe.prop('src', chrome.extension.getURL('sidebar.html'));
                        stayVisible = true;
                        clearTimeout(stayVisibleTimeout);
                        break;
                    case 'visible':
                        obj.show();
                        iframe.prop('src', chrome.extension.getURL('sidebar.html'));
                        stayVisibleTimeout = setTimeout(function() {
                            stayVisible = true;
                        }, 2000);
                        break;
                    case 'unconcerned':
                        if (!stayVisible) {
                            obj.hide();
                            clearTimeout(stayVisibleTimeout);
                        }
                        break;
                }
            }
        });

        return obj;
    };
});
