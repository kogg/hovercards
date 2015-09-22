var $ = require('jquery');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

$.analytics = function() {
    window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: Array.prototype.slice.call(arguments) }, '*');
};
