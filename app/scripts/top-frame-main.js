var $ = require('jquery');
var hovercards_container = $('<div class="hovercards-container"></div>').appendTo('html');

var sidebar_obj = require('./sidebar-inject')(hovercards_container, 'body', 'html', function(msg) {
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
