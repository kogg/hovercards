'use strict';

(function() {
    require(['load-html'], function(loadHtml) {
        /*jshint unused:false */
        chrome.runtime.onMessage.addListener(function(message, sender, callback) {
            if (message.msg !== 'load') {
                return;
            }
            if (message.key !== 'html') {
                return;
            }
            loadHtml(message.value, callback);
            return true;
        });
    });
}());
