var $            = require('jquery');
var common       = require('../common');
var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var TIMEOUT_BEFORE_CARD = 500;

var NameSpace = '.' + EXTENSION_ID;

var Cleanup       = 'cleanup' + NameSpace;
var Click         = 'click' + NameSpace;
var MouseLeave    = 'mouseleave' + NameSpace;
var MouseMove     = 'mousemove' + NameSpace + ' mouseenter' + NameSpace;
var ShowHoverCard = 'showhovercard' + NameSpace;

var current_obj = $();

module.exports = function(selector, get_url) {
    if (document.URL.match(/[&?]noyo=1/)) {
        return;
    }
    $('html').on(MouseMove, selector, function(e) {
        var obj = $(this);
        var url;
        var identity;
        if (obj.is(current_obj) || obj.has(current_obj).length || !(url = common.massage_url(get_url(obj))) || !(identity = network_urls.identify(url))) {
            return;
        }
        var last_e = e;
        var timeout = setTimeout(function() { obj.trigger(ShowHoverCard); }, TIMEOUT_BEFORE_CARD);
        current_obj.trigger(Cleanup);
        current_obj = obj
            .one(ShowHoverCard, function() {
                obj.trigger(Cleanup);
                console.log('show card for', obj);
            })
            .on(MouseMove, function(e) {
                last_e = e;
            })
            .one(MouseLeave + ' ' + Click, function() {
                obj.trigger(Cleanup);
                if (current_obj.is(obj)) {
                    current_obj = $();
                }
            })
            .on(Cleanup, function() {
                console.log('cleanup for', obj);
                obj.off(NameSpace);
                clearTimeout(timeout);
                timeout = null;
            })
            ;
    });
};
