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

    var identity_history = [];
    var back_button = $('<div></div>')
        .appendTo(obj)
        .addClass(extension_id + '-sidebar-back-button')
        .hide()
        .click(function() {
            identity_history.pop();
            sidebar_message({ msg: 'activate', by: 'back', url: network_urls.generate(_.last(identity_history)) });
        });

    var iframe = $('<iframe webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>')
        .appendTo(obj)
        .attr('src', chrome.extension.getURL('sidebar.html'))
        .attr('frameborder', '0')
        .mouseenter(function() {
            $(window).on('mousewheel', prevent_everything);
        })
        .mouseleave(function() {
            $(window).off('mousewheel', prevent_everything);
        });
    $(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange', function(event) {
        if (!iframe.is(event.target)) {
            return;
        }
        obj.addClass(extension_id + '-sidebar-enter-cancel-animation');
    });

    $('<div></div>')
        .appendTo(obj)
        .addClass(extension_id + '-sidebar-minimizer')
        .click(function() {
            obj.toggleClass(extension_id + '-sidebar-minimized');
            chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'event', 'sidebar', obj.hasClass(extension_id + '-sidebar-minimized') ? 'minimized' : 'unminimized'] });
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

    function prevent_everything(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    var sidebar_frame;
    var showing;
    function sendMessage(message) {
        switch (message.msg) {
            case 'load':
                var category;
                if (message.by !== 'back') {
                    if (_.chain(identity_history).last().isEqual(message.identity).value()) {
                        if (showing) {
                            category = (message.identity.type === 'url') ? 'url' : message.identity.api + ' ' + message.identity.type;
                            chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'event', 'sidebar', 'activated (same) ' + message.by, category] });
                            sidebar_frame.postMessage({ msg: 'sameload' }, '*');
                            return;
                        }
                    } else {
                        identity_history.push(message.identity);
                    }
                }
                if (identity_history.length > 1) {
                    back_button.show();
                } else {
                    back_button.hide();
                }
                showing = true;
                obj
                    .show()
                    .removeClass(extension_id + '-sidebar-leave')
                    .removeClass(extension_id + '-sidebar-minimized')
                    .addClass(extension_id + '-sidebar-enter');
                $(document).on('dblclick', dblclick_for_sidebar);
                category = (message.identity.type === 'url') ? 'url' : message.identity.api + ' ' + message.identity.type;
                chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'event', 'sidebar', 'activated ' + message.by, category] });
                window.top.postMessage({ msg: 'loaded' }, '*');
                break;
            case 'hide':
                if (!showing) {
                    break;
                }
                showing = false;
                obj
                    .removeClass(extension_id + '-sidebar-enter')
                    .removeClass(extension_id + '-sidebar-enter-cancel-animation')
                    .addClass(extension_id + '-sidebar-leave');
                $(document).off('dblclick', dblclick_for_sidebar);
                chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'event', 'sidebar', 'deactivated ' + message.by] });
                window.top.postMessage({ msg: 'hidden' }, '*');
                break;
        }
        sidebar_frame.postMessage(message, '*');
    }

    function dblclick_for_sidebar() {
        if (document.selection && document.selection.empty) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
        sidebar_message({ msg: 'hide', by: 'dblclick' });
    }

    var on_deck;
    function sidebar_message(request, frame) {
        if (!request) {
            return;
        }
        switch (request.msg) {
            case 'ready':
                sidebar_frame = frame;
                if (!on_deck) {
                    return;
                }
                sendMessage(on_deck);
                break;
            case 'activate':
                var possible_identity = network_urls.identify(request.url);
                if (!possible_identity) {
                    possible_identity = { type: 'url', id: request.url };
                }
                var msg = { msg: 'load', by: request.by, identity: possible_identity };
                if (!sidebar_frame) {
                    on_deck = msg;
                    return;
                }
                sendMessage(msg);
                break;
            case 'hide':
                if (!sidebar_frame) {
                    on_deck = null;
                    return;
                }
                sendMessage({ msg: 'hide', by: request.by });
                break;
        }
    }

    return obj;
};
