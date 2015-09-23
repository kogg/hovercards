if (document.URL.match(/[&?]hovercards=0/)) {
    return;
}

var $            = require('jquery');
var common       = require('../common');
var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');
var HOVERABLE_THINGS = [
    { selector: 'a[href]:not(.no-yo,.hoverZoomLink,[data-href],[data-expanded-url])', get_url: function(link) { return link.attr('href'); } },
    { selector: 'a[data-href]:not(.no-yo,.hoverZoomLink,[data-expanded-url])',        get_url: function(link) { return link.data('href'); } },
    { selector: 'a[data-expanded-url]:not(.no-yo,.hoverZoomLink,[data-href])',        get_url: function(link) { return link.data('expanded-url'); } },
    // FIXME Twitter follow button hack
    { selector: 'iframe.twitter-follow-button:not(.no-yo)',
      get_url: function(iframe) {
          var match = iframe.attr('src').match(/[?&]screen_name=([a-zA-Z0-9_]+)(?:&|$)/);
          if (!match || !match[1]) {
              return;
          }
          return 'https://twitter.com/' + match[1];
      } },
];

var TIMEOUT_BEFORE_CARD = 500;

var NameSpace = '.' + EXTENSION_ID;

var Cleanup       = 'cleanup' + NameSpace;
var Click         = 'click' + NameSpace;
var MouseLeave    = 'mouseleave' + NameSpace;
var MouseMove     = 'mousemove' + NameSpace + ' mouseenter' + NameSpace;
var ShowHoverCard = 'showhovercard' + NameSpace;

var current_obj = null;

$.fn.extend({
    hovercard: function(identity, e) {
        if (typeof identity === 'string') {
            identity = network_urls.identify(url);
        }
        if (!identity) {
            return this;
        }
        $.analytics('send', 'event', 'hovercard shown', 'hover link', (identity.type === 'url') ? 'url' : identity.api + ' ' + identity.type, { nonInteraction: true });
        return this;
    }
});

HOVERABLE_THINGS.forEach(function(hoverable) {
    $('html').on(MouseMove, hoverable.selector, function(e) {
        var obj = $(this);
        var url;
        var identity;
        if (obj.is(current_obj) || obj.has(current_obj).length || !(url = common.massage_url(hoverable.get_url(obj))) || !(identity = network_urls.identify(url))) {
            return;
        }
        var last_e = e;
        var timeout = setTimeout(function() { obj.trigger(ShowHoverCard); }, TIMEOUT_BEFORE_CARD);
        if (current_obj) {
            current_obj.trigger(Cleanup);
        }
        current_obj = obj
            .one(ShowHoverCard, function() {
                obj
                    .trigger(Cleanup)
                    .hovercard(identity, last_e);
            })
            .one(MouseLeave + ' ' + Click, function() {
                obj.trigger(Cleanup);
                current_obj = current_obj.is(obj) ? null : current_obj;
            })
            .on(MouseMove, function(e) {
                last_e = e;
            })
            .on(Cleanup, function() {
                obj.off(NameSpace);
                clearTimeout(timeout);
                timeout = null;
            });
    });
});
