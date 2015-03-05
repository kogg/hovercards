'use strict';

define('load-html', ['jquery'], function($) {
    function loadHtml(filename, callback) {
        $.ajax({
            url: chrome.extension.getURL(filename),
            dataType: 'html',
            success: callback
        });
    }

    return loadHtml;
});
