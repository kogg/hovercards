var $ = require('jquery');

var container = $('<div></div>')
    .appendTo('html')
    .addClass(chrome.i18n.getMessage('@@extension_id') + '-container');

var sidebar_obj = require('./sidebar-inject')(container, 'body', document, function(msg) {
    window.postMessage(msg, '*');
});

var sidebar_frame;
var sidebar_trigger = require('./sidebar-trigger')(function(msg) {
    sidebar_frame.postMessage(msg, '*');
    sidebar_obj.trigger('sidebar.msg', [msg]);
});

window.addEventListener('message', function(event) {
    if (event && event.data && event.data.msg === 'ready') {
        sidebar_frame = event.source;
    }
    sidebar_trigger(event.data);
}, false);
