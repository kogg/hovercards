var $ = require('jquery');

var common       = require('./common');
var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');
var TIMEOUT_BEFORE_CARD = 500;

var NameSpace = '.' + EXTENSION_ID;
var MouseLeave = 'mouseleave' + NameSpace;
var MouseMove = 'mousemove' + NameSpace + ' mouseenter' + NameSpace;
var ShowHoverCard = 'showhovercard' + NameSpace;

var obj_busy_with;

module.exports = function(selector, get_url) {
    $('html').on(MouseMove, selector, function(e) {
        var obj = $(this);
        var url;
        if ((obj_busy_with && (obj.is(obj_busy_with) || obj.has(obj_busy_with).length)) || !(url = common.massage_url(get_url(obj))) || !network_urls.identify(url)) {
            return;
        }
        if (obj_busy_with) {
            obj_busy_with.off(NameSpace);
            // TODO Hide Hovercard
        }
        obj_busy_with = obj;

        setTimeout(function() { obj.trigger(ShowHoverCard); }, TIMEOUT_BEFORE_CARD);
        var mouseposition = { x: e.pageX, y: e.pageY };
        obj
            .on(MouseMove, function(e) {
                mouseposition = { x: e.pageX, y: e.pageY };
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
                console.log('LOL', mouseposition);
            });
    });
};
