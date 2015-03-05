'use strict';

define('sidebar', ['jquery'], function($) {
    return function sidebar() {
        var obj = $('<div class="deckard-sidebar"></div>').append($('<iframe frameborder="0"></iframe>').prop('src', chrome.extension.getURL('sidebar.html')));

        var stayVisible = false;
        var stayVisibleTimeout;

        chrome.runtime.onMessage.addListener(function(request) {
            if (request.msg === 'sidebar' && request.key === 'display') {
                switch (request.value) {
                    case 'stay_visible':
                        obj.show();
                        stayVisible = true;
                        clearTimeout(stayVisibleTimeout);
                        break;
                    case 'visible':
                        obj.show();
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
