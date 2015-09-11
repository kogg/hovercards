var _ = require('underscore');
var $ = require('jquery');

var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = function sidebar() {
    var obj = $('<div></div>')
        .addClass(EXTENSION_ID + '-sidebar')
        .width(340)
        .hide()
        .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
            if (e.originalEvent.animationName !== 'slide-out-' + EXTENSION_ID) {
                return;
            }
            obj.hide();
        });

    $('<div></div>')
        .appendTo(obj)
        .addClass(EXTENSION_ID + '-sidebar-close-button')
        .click(function() {
            sidebar_message({ msg: EXTENSION_ID + '-hide', by: 'closebutton' });
        });

    var identity_history = [];
    var back_button = $('<div></div>')
        .appendTo(obj)
        .addClass(EXTENSION_ID + '-sidebar-back-button')
        .hide()
        .click(function() {
            identity_history.pop();
            sidebar_message({ msg: EXTENSION_ID + '-activate', by: 'back', url: network_urls.generate(_.last(identity_history)) });
        });

    var iframe = $('<iframe webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>')
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
        obj.addClass(EXTENSION_ID + '-sidebar-enter-cancel-animation');
    });

    var minimizer = $('<div></div>')
        .appendTo(obj)
        .addClass(EXTENSION_ID + '-sidebar-minimizer')
        .click(function() {
            obj.toggleClass(EXTENSION_ID + '-sidebar-minimized');
            window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'event', 'sidebar ' + (obj.hasClass(EXTENSION_ID + '-sidebar-minimized') ? 'minimized' : 'unminimized'), 'minimizer'] }, '*');
        });

    window.addEventListener('message', function(event) {
        if (!event || !event.data) {
            return;
        }
        if (event.data.msg === EXTENSION_ID + '-fullscreen') {
            obj.toggleClass(EXTENSION_ID + '-fullscreen', event.data.value || false);
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
            case EXTENSION_ID + '-load':
                var label;
                if (message.by !== 'back') {
                    if (_.chain(identity_history).last().isEqual(message.identity).value()) {
                        if (showing) {
                            switch (message.by) {
                                case 'carlito':
                                case 'res-key(86)':
                                case 'res-key(186)':
                                    sidebar_message({ msg: EXTENSION_ID + '-hide', by: message.by });
                                    return;
                            }
                            label = (message.identity.type === 'url') ? 'url' : message.identity.api + ' ' + message.identity.type;
                            window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'event', 'sidebar activated (same)', message.by, label] }, '*');
                            sidebar_frame.postMessage({ msg: EXTENSION_ID + '-sameload' }, '*');
                            return;
                        }
                    } else {
                        identity_history.push(message.identity);
                    }
                }
                chrome.runtime.sendMessage({ type: 'activated', carlito: _.isEqual(message.identity, network_urls.identify(document.URL) || { type: 'url', id: document.URL }) });
                if (identity_history.length > 1) {
                    back_button.show();
                } else {
                    back_button.hide();
                }
                showing = true;
                obj
                    .show()
                    .removeClass(EXTENSION_ID + '-sidebar-leave')
                    .removeClass(EXTENSION_ID + '-sidebar-minimized')
                    .addClass(EXTENSION_ID + '-sidebar-enter');
                $(document).on('dblclick', dblclick_for_sidebar);
                label = (message.identity.type === 'url') ? 'url' : message.identity.api + ' ' + message.identity.type;
                window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'event', 'sidebar activated', message.by, label] }, '*');
                break;
            case EXTENSION_ID + '-hide':
                if (!showing) {
                    break;
                }
                chrome.runtime.sendMessage({ type: 'activated', carlito: false });
                showing = false;
                obj
                    .removeClass(EXTENSION_ID + '-sidebar-enter')
                    .removeClass(EXTENSION_ID + '-sidebar-enter-cancel-animation')
                    .addClass(EXTENSION_ID + '-sidebar-leave');
                $(document).off('dblclick', dblclick_for_sidebar);
                window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'event', 'sidebar deactivated', message.by] }, '*');
                break;
        }
        sidebar_frame.postMessage(message, '*');
    }

    function dblclick_for_sidebar(e) {
        var target = $(e.target);
        if (back_button.is(target) || $.contains(back_button[0], target[0])) {
            return;
        }
        if (document.selection && document.selection.empty) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
        sidebar_message({ msg: EXTENSION_ID + '-hide', by: 'dblclick' });
    }

    var on_deck;
    function sidebar_message(request, frame) {
        if (!request) {
            return;
        }
        switch (request.msg) {
            case EXTENSION_ID + '-ready':
                sidebar_frame = frame;
                if (!on_deck) {
                    return;
                }
                sendMessage(on_deck);
                break;
            case EXTENSION_ID + '-activate':
                var possible_identity = network_urls.identify(request.url) || { type: 'url', id: request.url };
                var message = { msg: EXTENSION_ID + '-load', by: request.by, identity: possible_identity };
                if (!sidebar_frame) {
                    on_deck = message;
                    if (!iframe.is('.on-dom')) {
                        iframe
                            .addClass('on-dom')
                            .insertBefore(minimizer);
                    }
                    return;
                }
                sendMessage(message);
                break;
            case EXTENSION_ID + '-Esc':
                if (sidebar_frame) {
                    sendMessage(request);
                    break;
                }
                /* falls through */
            case EXTENSION_ID + '-hide':
                if (!sidebar_frame) {
                    on_deck = null;
                    if (!iframe.is('.on-dom')) {
                        iframe
                            .addClass('on-dom')
                            .insertBefore(minimizer);
                    }
                    return;
                }
                sendMessage({ msg: EXTENSION_ID + '-hide', by: request.by });
                break;
        }
    }

    return obj;
};
