var $ = require('jquery');

var common       = require('./common');
var network_urls = require('YoCardsApiCalls/network-urls');

var CARD_SIZES = { account: { height: 156, width: 300 }, content: { height: 200, width: 300 } };
var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');
var TIMEOUT_BEFORE_CARD = 500;

var NameSpace = '.' + EXTENSION_ID;
var MouseLeave = 'mouseleave' + NameSpace;
var MouseMove = 'mousemove' + NameSpace + ' mouseenter' + NameSpace;
var ShowHoverCard = 'showhovercard' + NameSpace;

var hovercard;
var obj_busy_with;

module.exports = function(selector, get_url) {
    $('html').on(MouseMove, selector, function(e) {
        var obj = $(this);
        var url;
        var identity;
        if ((obj_busy_with && (obj.is(obj_busy_with) || obj.has(obj_busy_with).length)) || !(url = common.massage_url(get_url(obj))) || !(identity = network_urls.identify(url))) {
            return;
        }
        if (obj_busy_with) {
            obj_busy_with.off(NameSpace);
            // TODO Hide Hovercard
        }
        obj_busy_with = obj;

        setTimeout(function() { obj.trigger(ShowHoverCard); }, TIMEOUT_BEFORE_CARD);
        var mouse_x = e.pageX;
        obj
            .on(MouseMove, function(e) {
                mouse_x = e.pageX;
            })
            .one(MouseLeave, function() {
                obj.off(NameSpace);
                if (obj_busy_with.is(obj)) {
                    obj_busy_with = null;
                    // TODO Hide Hovercard
                }
            })
            .one(ShowHoverCard, function() {
                obj.off(NameSpace);
                if (!hovercard) {
                    hovercard = $('<div>Hey Punk</div>')
                        .appendTo(document.location.protocol === 'chrome-extension:' ? 'body' : 'html')
                        .css('background', 'pink')
                        .css('z-index', 2147483647);
                }
                hovercard
                    .height(CARD_SIZES[identity.type].height)
                    .width(CARD_SIZES[identity.type].width)
                    .offset(function() {
                        var offset = obj.offset();
                        return { left: Math.max(Math.min(mouse_x, offset.left + obj.width() - CARD_SIZES[identity.type].width), offset.left),
                                 top: (offset.top > CARD_SIZES[identity.type].height) ? offset.top - CARD_SIZES[identity.type].height : offset.top + obj.height() };
                    });
            });
    });
};
