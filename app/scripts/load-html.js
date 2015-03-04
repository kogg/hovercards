'use strict';

/* exported loadHtml */
var loadHtml = (function() {
    function loadHtml(filename, callback) {
        $.ajax({
            url: chrome.extension.getURL(filename),
            dataType: 'html',
            success: callback
        });
    }

    return loadHtml;
}());
