'use strict';

(function() {
    require(['load-html'], function(loadHtml) {
        /*jshint unused:false */
        chrome.runtime.onMessage.addListener(function(message, sender, callback) {
            if (message.cmd !== 'load-html') {
                return;
            }
            loadHtml(message.filename, callback);
            return true;
        });
    });
}());
