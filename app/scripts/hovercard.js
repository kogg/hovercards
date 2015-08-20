var $ = require('jquery');

var common       = require('./common');
var network_urls = require('YoCardsApiCalls/network-urls');

// FIXME This is dumb
var CARD_SIZES = { imgur:      { content:    { height: 150, width: 300 }, account: { height: 131, width: 300 } },
                   instagram:  { content:    { height: 150, width: 300 }, account: { height: 131, width: 300 } },
                   reddit:     { discussion: { height: 156, width: 300 }, account: { height: 131, width: 300 } },
                   soundcloud: { content:    { height: 150, width: 300 }, account: { height: 131, width: 300 } },
                   twitter:    { content:    { height: 156, width: 300 }, account: { height: 131, width: 300 } },
                   youtube:    { content:    { height: 150, width: 300 }, account: { height: 131, width: 300 } } };
var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');
var TIMEOUT_BEFORE_CARD = 500;
var TIMEOUT_BEFORE_FADEOUT = 100;
var PADDING_FROM_EDGES = 10;

var NameSpace = '.' + EXTENSION_ID;
var Cleanup = 'cleanup' + NameSpace;
var Click = 'click' + NameSpace;
var HoverCardClick = 'hovercardclick' + NameSpace;
var MouseLeave = 'mouseleave' + NameSpace;
var MouseMove = 'mousemove' + NameSpace + ' mouseenter' + NameSpace;
var ShowHoverCard = 'showhovercard' + NameSpace;

var hovercard = $();
var current_obj = $();

var going_to_send;
var send_message = function(message) { going_to_send = message; };
var get_ready = function(frame) {
    get_ready = function() { };
    send_message = function(message) { frame.postMessage(message, '*'); };
    if (going_to_send) {
        send_message(going_to_send);
    }
    going_to_send = undefined;
};

window.addEventListener('message', function(event) {
    if (!event || !event.data) {
        return;
    }
    switch (event.data.msg) {
        case EXTENSION_ID + '-hovercard-clicked':
            hovercard.trigger('click');
            break;
    }
}, false);

module.exports = function(selector, get_url, accept_identity) {
    $('html').on(MouseMove, selector, function(e) {
        var obj = $(this);
        var url;
        var identity;
        if (obj.is(current_obj) || obj.has(current_obj).length || !(url = common.massage_url(get_url(obj))) || !(identity = network_urls.identify(url))) {
            return;
        }
        if (accept_identity && !accept_identity(identity, obj)) {
            return;
        }
        current_obj.off(NameSpace);
        hovercard.trigger(Cleanup);
        send_message({ msg: EXTENSION_ID + '-hide' });
        current_obj = obj;
        setTimeout(function() { obj.trigger(ShowHoverCard); }, TIMEOUT_BEFORE_CARD);
        var last_e = e;
        obj
            .on(MouseMove, function(e) {
                last_e = e;
            })
            .one(MouseLeave + ' ' + Click, function() {
                obj.off(NameSpace);
                if (current_obj.is(obj)) {
                    current_obj = $();
                    hovercard.trigger(Cleanup);
                    send_message({ msg: EXTENSION_ID + '-hide' });
                }
            })
            .one(ShowHoverCard, function() {
                window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'event', 'hovercard shown', 'hover link', (identity.type === 'url') ? 'url' : identity.api + ' ' + identity.type, { nonInteraction: true }] }, '*');
                if (!hovercard.length) {
                    hovercard = $('<div></div>')
                        .appendTo(document.location.protocol === 'chrome-extension:' ? 'body' : 'html')
                        .addClass(EXTENSION_ID + '-hovercard');
                    window.addEventListener('message', function(event) {
                        if (!event || !event.data) {
                            return;
                        }
                        switch (event.data.msg) {
                            case EXTENSION_ID + '-hovercard-ready':
                                get_ready(event.source);
                                break;
                        }
                    }, false);
                    $('<iframe></iframe>')
                        .appendTo(hovercard)
                        .attr('src', chrome.extension.getURL('hovercard.html'))
                        .attr('frameborder', '0');
                }
                send_message({ msg: EXTENSION_ID + '-load', identity: identity });
                obj.off(NameSpace);
                var target = $(e.target);
                var offset = target.offset();
                var is_top = offset.top - CARD_SIZES[identity.api][identity.type].height - PADDING_FROM_EDGES > $(window).scrollTop();
                var start = Date.now();
                hovercard
                    .trigger(Cleanup)
                    .show()
                    .toggleClass(EXTENSION_ID + '-hovercard-from-top', is_top)
                    .toggleClass(EXTENSION_ID + '-hovercard-from-bottom', !is_top)
                    .height(CARD_SIZES[identity.api][identity.type].height)
                    .width(CARD_SIZES[identity.api][identity.type].width)
                    .offset({ top:  is_top ? offset.top - CARD_SIZES[identity.api][identity.type].height : offset.top + target.height(),
                              left: Math.max(PADDING_FROM_EDGES,
                                             Math.min($(window).scrollLeft() + $(window).width() - CARD_SIZES[identity.api][identity.type].width - PADDING_FROM_EDGES,
                                                      last_e.pageX + 1)) })
                    .on(Cleanup, function() {
                        window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'timing', 'hovercard', 'showing', Date.now() - start, (identity.type === 'url') ? 'url' : identity.api + ' ' + identity.type] }, '*');
                        hovercard
                            .off(NameSpace)
                            .hide();
                    })
                    .on(Click, function() {
                        obj
                            .trigger(HoverCardClick, [url])
                            .off(NameSpace);
                        current_obj = $();
                        hovercard.trigger(Cleanup);
                        send_message({ msg: EXTENSION_ID + '-hide' });
                    });
                obj.on('click', function() {
                    obj.off(NameSpace);
                    current_obj = $();
                    hovercard.trigger(Cleanup);
                });
                var both = obj.add(hovercard);
                both.on(MouseLeave, function(e) {
                    var to = $(e.toElement);
                    if (both.is(to) || both.has(to).length) {
                        return;
                    }
                    var kill_timeout = setTimeout(function() {
                        obj.off(NameSpace);
                        current_obj = $();
                        hovercard.trigger(Cleanup);
                        send_message({ msg: EXTENSION_ID + '-hide' });
                    }, TIMEOUT_BEFORE_FADEOUT);
                    both.one(MouseMove, function() {
                        clearTimeout(kill_timeout);
                    });
                });
            });
    });
};
