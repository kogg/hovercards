'use strict';

define('load-html', function() {
    function loadHtml(filename, callback) {
        $.ajax({
            url: chrome.extension.getURL(filename),
            dataType: 'html',
            success: callback
        });
    }

    return loadHtml;
});
