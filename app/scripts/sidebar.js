'use strict';

define('sidebar', ['jquery'], function($) {
    return function sidebar() {
        var obj = $('<div class="deckard-sidebar"></div>').append($('<iframe frameborder="0"></iframe>').prop('src', chrome.extension.getURL('sidebar.html')));

        chrome.runtime.onMessage.addListener(function(request, sender) {
            /*jshint unused:false */
            if (request.msg === 'request-info') {
                if (request.key !== 'forget') {
                    obj.show();
                }
            }
        });

        return obj;
    };
});
