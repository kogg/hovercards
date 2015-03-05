'use strict';

define('sidebar', ['jquery'], function($) {
    return function sidebar() {
        var obj = $('<div class="deckard-sidebar"></div>').append($('<iframe frameborder="0"></iframe>').prop('src', chrome.extension.getURL('sidebar.html')));

        var stayOpen = false;
        var stayOpenTimeout;

        chrome.runtime.onMessage.addListener(function(request, sender) {
            /*jshint unused:false */
            if (request.msg === 'sidebar' && request.key === 'display') {
                if (request.value === 'visible') {
                    obj.show();
                    stayOpenTimeout = setTimeout(function() {
                        stayOpen = true;
                    }, 2000);
                } else if (request.value === 'uninterested') {
                    if (!stayOpen) {
                        obj.hide();
                        clearTimeout(stayOpenTimeout);
                    }
                }
            }
        });

        return obj;
    };
});
