var $ = require('jquery');

var extension_id = chrome.i18n.getMessage('@@extension_id');

module.exports = function sidebar() {
    var obj = $('<div></div>')
        .addClass(extension_id + '-sidebar')
        .width(340)
        .hide()
        .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
            if (e.originalEvent.animationName !== 'slide-out-' + extension_id) {
                return;
            }
            obj.hide();
        });

    $('<div></div>')
        .appendTo(obj)
        .addClass(extension_id + '-sidebar-close-button')
        .click(function() {
            sidebar_message({ msg: 'hide' });
        });

    function prevent_everything(e) {
        e.preventDefault();
        e.stopPropagation();
    }

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

    window.addEventListener('message', function(event) {
        if (!event || !event.data) {
            return;
        }
        if (event.data.msg === extension_id + '-fullscreen') {
            obj.toggleClass(extension_id + '-fullscreen', event.data.value || false);
            return;
        }
        sidebar_message(event.data, event.source);
    }, false);

    function dblclick_for_sidebar() {
        if (document.selection && document.selection.empty) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
        sidebar_message({ msg: 'hide' });
    }

    var sidebar_frame;

    function sendMessage(msg) {
        sidebar_frame.postMessage(msg, '*');
        switch (msg.msg) {
            case 'load':
                obj
                    .show()
                    .removeClass(extension_id + '-sidebar-leave')
                    .addClass(extension_id + '-sidebar-enter');
                $(document).on('dblclick', dblclick_for_sidebar);
                sidebar_message({ msg: 'loaded' });
                break;
            case 'hide':
                obj
                    .removeClass(extension_id + '-sidebar-enter')
                    .addClass(extension_id + '-sidebar-leave');
                $(document).off('dblclick', dblclick_for_sidebar);
                sidebar_message({ msg: 'hidden' });
                break;
        }
    }

    var url;

    function sidebar_message(request, frame) {
        if (!request) {
            return;
        }
        switch (request.msg) {
            case 'ready':
                sidebar_frame = frame;
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
                if (!sidebar_frame) {
                    return;
                }
                sendMessage(msg);
                break;
            case 'hide':
                url = null;
                if (!sidebar_frame) {
                    return;
                }
                sendMessage({ msg: 'hide' });
                break;
        }
    }

    return obj;
};
