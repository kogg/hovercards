var $ = require('jquery');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = function($body) {
    if (window.self === window.top) {
        return;
    }

    $body = $($body || 'body');

    $body.on('analytics.' + EXTENSION_ID, function() {
        console.log('passing along', Array.prototype.slice.call(arguments, 1));
        window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: Array.prototype.slice.call(arguments, 1) }, '*');
    });
};
