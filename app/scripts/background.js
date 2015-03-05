'use strict';

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
    /*jshint unused:false */
    if (message.msg !== 'load') {
        return;
    }
    if (message.key !== 'html') {
        return;
    }
    require(['load-html'], function(loadHtml) {
        loadHtml(message.value, callback);
    });
    return true;
});
