'use strict';

define('sidebar', ['jquery'], function($) {
    return function sidebar() {
        var obj = $('<div class="deckard-sidebar"></div>').append($('<iframe frameborder="0"></iframe>').prop('src', chrome.extension.getURL('sidebar.html')));

        chrome.runtime.onMessage.addListener(function(request, sender) {
            /*jshint unused:false */
            if (request.msg === 'sidebar') {
                if (request.key === 'display') {
                    if (request.value === 'visible') {
                        obj.show();
                    } else if (request.value === 'uninterested') {
                        obj.hide();
                    }
                }
            }
        });

        return obj;
    };
});
