var $ = require('jquery');

var container = $('<div></div>')
    .appendTo('html')
    .addClass(chrome.i18n.getMessage('@@extension_id') + '-container');

var sidebar_obj = require('./sidebar-inject')(container, 'body', document, function(msg) {
    window.postMessage(msg, '*');
});

var sidebar_frame;
var sidebar_trigger = (function sidebarTrigger(sendMessage) {
    var ready;
    var url;

    return function(request) {
        if (!request) {
            return;
        }
        sendMessage = sendMessage || function() {};
        switch (request.msg) {
            case 'ready':
                ready = true;
                if (!url) {
                    return;
                }
                sendMessage({ msg: 'load', url: url });
                break;
            case 'activate':
                var msg;
                if (request.url !== url) {
                    msg = { msg: 'load', url: request.url };
                    url = request.url;
                } else {
                    msg = { msg: 'hide' };
                    url = null;
                }
                if (!ready) {
                    return;
                }
                sendMessage(msg);
                break;
            case 'hide':
                url = null;
                if (!ready) {
                    return;
                }
                sendMessage({ msg: 'hide' });
                break;
        }
    };
}(function(msg) {
    sidebar_frame.postMessage(msg, '*');
    sidebar_obj.trigger('sidebar.msg', [msg]);
}));

window.addEventListener('message', function(event) {
    if (event && event.data && event.data.msg === 'ready') {
        sidebar_frame = event.source;
    }
    sidebar_trigger(event.data);
}, false);
