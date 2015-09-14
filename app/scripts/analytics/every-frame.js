var $ = require('jquery');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = function($html) {
    $html = $($html || 'html');

    $html.on('analytics.' + EXTENSION_ID, function() {
        console.log('passing to top frame', Array.prototype.slice.call(arguments, 1));
        window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: Array.prototype.slice.call(arguments, 1) }, '*');
    });
};
