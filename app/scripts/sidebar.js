'use strict';

define('sidebar', ['jquery'], function($) {
    return function sidebar() {
        var obj = $('<div class="deckard-sidebar"></div>').append($('<iframe frameborder="0"></iframe>').prop('src', chrome.extension.getURL('sidebar.html')));

        var stayOpen = false;
        var stayOpenTimeout;

        chrome.runtime.onMessage.addListener(function(request, sender) {
            /*jshint unused:false */
            if (request.msg === 'sidebar' && request.key === 'display') {
                switch (request.value) {
                    case 'visible':
                        obj.show();
                        stayOpenTimeout = setTimeout(function() {
                            stayOpen = true;
                        }, 2000);
                        break;
                    case 'unconcerned':
                        if (!stayOpen) {
                            obj.hide();
                            clearTimeout(stayOpenTimeout);
                        }
                        break;
                }
            }
        });

        return obj;
    };
});
