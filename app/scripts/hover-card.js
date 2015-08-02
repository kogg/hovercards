var $ = require('jquery');

var common       = require('./common');
var network_urls = require('YoCardsApiCalls/network-urls');

var CARD_SIZES = { content:    { height: 200, width: 300 },
                   discussion: { height: 200, width: 300 },
                   account:    { height: 156, width: 300 } };
var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');
var TIMEOUT_BEFORE_CARD = 500;
var TIMEOUT_BEFORE_FADEOUT = 100;
var PADDING_FROM_EDGES = 10;

var NameSpace = '.' + EXTENSION_ID;
var Click = 'click' + NameSpace;
var HoverCardClick = 'hovercardclick' + NameSpace;
var MouseLeave = 'mouseleave' + NameSpace;
var MouseMove = 'mousemove' + NameSpace + ' mouseenter' + NameSpace;
var ShowHoverCard = 'showhovercard' + NameSpace;

var hovercard = $();
var current_obj = $();

module.exports = function(selector, get_url) {
    $('html').on(MouseMove, selector, function(e) {
        var obj = $(this);
        var url;
        var identity;
        if (obj.is(current_obj) || obj.has(current_obj).length || !(url = common.massage_url(get_url(obj))) || !(identity = network_urls.identify(url))) {
            return;
        }
        current_obj.off(NameSpace);
        hovercard
            .hide()
            .off(NameSpace);
        current_obj = obj;
        setTimeout(function() { obj.trigger(ShowHoverCard); }, TIMEOUT_BEFORE_CARD);
        var last_e = e;
        obj
            .on(MouseMove, function(e) {
                last_e = e;
            })
            .one(MouseLeave, function() {
                obj.off(NameSpace);
                if (current_obj.is(obj)) {
                    current_obj = $();
                    hovercard
                        .off(NameSpace)
                        .hide();
                }
            })
            .one(ShowHoverCard, function() {
                window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'event', 'hovercard', 'show', (identity.type === 'url') ? 'url' : identity.api + ' ' + identity.type] }, '*');
                if (!hovercard.length) {
                    hovercard = $('<div></div>')
                        .appendTo(document.location.protocol === 'chrome-extension:' ? 'body' : 'html')
                        .css('background', 'pink')
                        .css('z-index', 2147483647);
                }
                obj.off(NameSpace);
                hovercard
                    .off(NameSpace)
                    .show()
                    .height(CARD_SIZES[identity.type].height)
                    .width(CARD_SIZES[identity.type].width)
                    .offset(function() {
                        var target = $(e.target);
                        var offset = target.offset();
                        return { top:  (offset.top + target.height() + CARD_SIZES[identity.type].height + PADDING_FROM_EDGES < $(window).scrollTop() + $(window).height()) ? offset.top + target.height() : offset.top - CARD_SIZES[identity.type].height,
                                 left: Math.max(PADDING_FROM_EDGES,
                                                Math.min($(window).scrollLeft() + $(window).width() - CARD_SIZES[identity.type].width - PADDING_FROM_EDGES,
                                                         Math.max(offset.left,
                                                                  Math.min(offset.left + target.width() - CARD_SIZES[identity.type].width,
                                                                           last_e.pageX)))) };
                    })
                    .on(Click, function() {
                        obj
                            .trigger(HoverCardClick, [url])
                            .off(NameSpace);
                        current_obj = $();
                        hovercard
                            .off(NameSpace)
                            .hide();
                    });
                var both = obj.add(hovercard);
                both
                    .on(MouseLeave, function(e) {
                        var to = $(e.toElement);
                        if (both.is(to) || both.has(to).length) {
                            return;
                        }
                        var kill_timeout = setTimeout(function() {
                            obj.off(NameSpace);
                            current_obj = $();
                            hovercard
                                .off(NameSpace)
                                .hide();
                        }, TIMEOUT_BEFORE_FADEOUT);
                        both.one(MouseMove, function() {
                            clearTimeout(kill_timeout);
                        });
                    });
            });
    });
};
