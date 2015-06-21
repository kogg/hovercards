var _            = require('underscore');
var $            = require('jquery');
var network_urls = require('YoCardsApiCalls/network-urls');

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
            sidebar_message({ msg: 'hide', by: 'closebutton' });
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
        sidebar_message({ msg: 'hide', by: 'dblclick' });
    }

    var sidebar_frame;

    function sendMessage(message) {
        sidebar_frame.postMessage(message, '*');
        switch (message.msg) {
            case 'load':
                obj
                    .show()
                    .removeClass(extension_id + '-sidebar-leave')
                    .addClass(extension_id + '-sidebar-enter');
                $(document).on('dblclick', dblclick_for_sidebar);
                chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'event', message.by, 'activated', [message.identity.api || 'none', message.identity.type].join('/')] });
                window.top.postMessage({ msg: 'loaded' }, '*');
                break;
            case 'hide':
                obj
                    .removeClass(extension_id + '-sidebar-enter')
                    .addClass(extension_id + '-sidebar-leave');
                $(document).off('dblclick', dblclick_for_sidebar);
                chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'event', message.by, 'deactivated'] });
                window.top.postMessage({ msg: 'hidden' }, '*');
                break;
        }
    }

    var identity;
    var by;

    function sidebar_message(request, frame) {
        if (!request) {
            return;
        }
        switch (request.msg) {
            case 'ready':
                sidebar_frame = frame;
                if (!identity) {
                    return;
                }
                sendMessage({ msg: 'load', by: by, identity: identity });
                break;
            case 'activate':
                var possible_identity = network_urls.identify(request.url);
                if (!possible_identity) {
                    possible_identity = { type: 'url', id: request.url };
                }
                var msg;
                if (_.isEqual(possible_identity, identity)) {
                    msg = { msg: 'hide', by: request.by };
                    identity = null;
                } else {
                    msg = { msg: 'load', by: request.by, identity: possible_identity };
                    identity = possible_identity;
                }
                if (!sidebar_frame) {
                    by = request.by;
                    return;
                }
                sendMessage(msg);
                break;
            case 'hide':
                identity = null;
                if (!sidebar_frame) {
                    return;
                }
                sendMessage({ msg: 'hide', by: request.by });
                break;
        }
    }

    return obj;
};
