var $ = require('jquery');

var common       = require('./common');
var network_urls = require('YoCardsApiCalls/network-urls');

var CARD_SIZES = { account: { height: 156, width: 300 }, content: { height: 200, width: 300 } };
var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');
var TIMEOUT_BEFORE_CARD = 500;
var TIMEOUT_BEFORE_FADEOUT = 100;

var NameSpace = '.' + EXTENSION_ID;
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
        var mouse_x = e.pageX;
        obj
            .on(MouseMove, function(e) {
                mouse_x = e.pageX;
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
                        var offset = obj.offset();
                        return { left: Math.max(Math.min(mouse_x, offset.left + obj.width() - CARD_SIZES[identity.type].width), offset.left),
                                 top: (offset.top > CARD_SIZES[identity.type].height) ? offset.top - CARD_SIZES[identity.type].height : offset.top + obj.height() };
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
