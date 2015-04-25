var $ = require('jquery');

var notifications_inject = require('./notifications-inject');

var hovercards_container = $('<div class="hovercards-container"></div>').appendTo('html');
notifications_inject(hovercards_container);

var sidebar_obj = require('./sidebar-inject')(hovercards_container, 'body', 'html');

var sidebar_trigger = require('./sidebar-trigger')();
var sidebar_frame;
window.addEventListener('message', function(event) {
    if (event && event.data && event.data.msg === 'ready') {
        sidebar_frame = event.source;
    }
    sidebar_trigger(event.data, function(msg) {
        sidebar_frame.postMessage(msg, '*');
        sidebar_obj.trigger('sidebar.msg', [msg]);
    });
}, false);
