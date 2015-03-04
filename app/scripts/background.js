'use strict';

(function() {
    /* global loadHtml */
    chrome.runtime.onMessage.addListener(function(message, sender, callback) {
        /*jshint unused:false */
        if (message.cmd !== 'load_html') {
            return;
        }
        loadHtml(message.filename, callback);
        return true;
    });
    loadHtml();
}());
