var $ = require('jquery');

require('./analytics/top-frame')();

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

// TODO Is this a shim or permanent?
window.addEventListener('message', function(event) {
    if (!event || !event.data) {
        return;
    }
    var message = event.data;
    if (message.msg !== EXTENSION_ID + '-analytics') {
        return;
    }
    $('body').trigger('analytics.' + EXTENSION_ID, message.request);
});
