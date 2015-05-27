var $ = require('jquery');

var extension_id = chrome.i18n.getMessage('@@extension_id');

module.exports = function sidebarInjectOn(inject_into, sendMessage) {

    var obj = $('<div></div>')
        .appendTo($(inject_into))
        .addClass(extension_id + '-sidebar')
        .width(340)
        .hide()
        .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
            if (e.originalEvent.animationName !== 'slide-out-' + extension_id) {
                return;
            }
            obj.hide();
        })
        .on('sidebar.msg', function(e, request) {
            switch (request.msg) {
                case 'load':
                    obj
                        .show()
                        .removeClass(extension_id + '-sidebar-leave')
                        .addClass(extension_id + '-sidebar-enter');
                    sendMessage({ msg: 'loaded' });
                    break;
                case 'hide':
                    obj
                        .removeClass(extension_id + '-sidebar-enter')
                        .addClass(extension_id + '-sidebar-leave');
                    sendMessage({ msg: 'hidden' });
                    break;
            }
        });

    window.addEventListener('message', function(event) {
        if (!event || !event.data || event.data.msg !== extension_id + '-fullscreen') {
            return;
        }
        obj.toggleClass(extension_id + '-fullscreen', event.data.value || false);
    }, false);

    var prevent_everything = function(e) {
        e.preventDefault();
        e.stopPropagation();
    };

    $('<div></div>')
        .appendTo(obj)
        .addClass(extension_id + '-sidebar-close-button')
        .click(function() {
            sendMessage({ msg: 'hide' });
        });

    $('<iframe webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>')
        .appendTo(obj)
        .attr('src', chrome.extension.getURL('sidebar.html'))
        .attr('frameborder', '0')
        .mouseenter(function() {
            $(window).on('mousewheel', prevent_everything);
        })
        .mouseleave(function() {
            $(window).off('mousewheel', prevent_everything);
        });

    $(document).dblclick(function() {
        sendMessage({ msg: 'hide' });
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
        obj.trigger('sidebar.msg', [msg]);
    }));

    window.addEventListener('message', function(event) {
        if (event && event.data && event.data.msg === 'ready') {
            sidebar_frame = event.source;
        }
        sidebar_trigger(event.data);
    }, false);

    return obj;
};
