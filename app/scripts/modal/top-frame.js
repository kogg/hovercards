var $ = require('jquery');
require('./common');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

$.modal = function() {
    console.log('modal', arguments);
};

window.addEventListener('message', function(event) {
    if (!event || !event.data) {
        return;
    }
    var message = event.data;
    if (message.msg !== EXTENSION_ID + '-modal') {
        return;
    }
    $.modal(message.identity, message.obj);
});
