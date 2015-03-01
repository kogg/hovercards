/* global $ */
/* exported loadHtml */
'use strict';

function loadHtml() {
    chrome.runtime.onMessage.addListener(function(message, sender, callback) {
        /*jshint unused:false */
        if (message.cmd !== 'load_html') {
            return;
        }
        $.ajax({
            url: chrome.extension.getURL(message.fileName),
            dataType: 'html',
            success: callback
        });
        return true;
    });
}
