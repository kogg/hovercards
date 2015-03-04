'use strict';

/* exported loadHtml */
function loadHtml(filename, callback) {
    $.ajax({
        url: chrome.extension.getURL(filename),
        dataType: 'html',
        success: callback
    });
}
