if (document.URL.match(/[&?]hovercards=0/)) {
    return;
}

var $            = require('jquery');
var common       = require('../common');
var network_urls = require('YoCardsApiCalls/network-urls');

require('../feedback/hovercard');

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

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');
var PADDING_FROM_EDGES = 10;
var TIMEOUT_BEFORE_CARD = 500;
var TIMEOUT_BEFORE_FADEOUT = 100;

var NameSpace = '.' + EXTENSION_ID;

var Cleanup    = 'cleanup' + NameSpace;
var Click      = 'click' + NameSpace;
var MouseLeave = 'mouseleave' + NameSpace;
var MouseMove  = 'mousemove' + NameSpace + ' mouseenter' + NameSpace;

var current_obj;

var disabled;
// FIXME Move this out into its own "feature"
chrome.storage.sync.get('disabled', function(obj) {
    disabled = obj.disabled || {};

    chrome.storage.onChanged.addListener(function(changes, area_name) {
        if (area_name !== 'sync' || !('disabled' in changes)) {
            return;
        }
        disabled = changes.disabled.newValue;
    });
});
function accept_identity(identity, obj) {
    if (!disabled || (disabled[identity.api] && disabled[identity.api][identity.type])) {
        return false;
    }
    return identity.api !== document.domain.replace(/\.com$/, '').replace(/^.*\./, '') ||
           (identity.api === 'imgur' && identity.type === 'account' && !obj.is('.account-user-name') && !obj.parents('.options,.user-dropdown').length) ||
           (identity.api === 'instagram' && identity.type === 'account' && !obj.is('.-cx-PRIVATE-Navigation__menuLink') && !obj.parents('.dropdown').length) ||
           (identity.api === 'reddit' && (identity.type === 'account' ? !$('body.res').length && !obj.parents('.tabmenu,.user').length :
                                                                        obj.parents('.usertext-body,.search-result-body').length)) ||
           (identity.api === 'twitter' && identity.type === 'account' && document.domain === 'tweetdeck.twitter.com') ||
           (identity.api === 'youtube' && document.URL.indexOf('youtube.com/embed') !== -1);
}

HOVERABLE_THINGS.forEach(function(hoverable) {
    $('html').on(MouseMove, hoverable.selector, function(e) {
        var obj = $(this);
        var url;
        var identity;
        if (obj.is(current_obj) || obj.has(current_obj).length ||
            !(url = common.massage_url(hoverable.get_url(obj))) ||
            !(identity = network_urls.identify(url)) ||
            !accept_identity(identity, obj)) {
            return;
        }
        if (current_obj) {
            current_obj.trigger(Cleanup);
        }
        var last_e = e;
        var timeout = setTimeout(function() {
            obj
                .trigger(Cleanup)
                .hovercard(identity, last_e);
        }, TIMEOUT_BEFORE_CARD);
        current_obj = obj
            .one(Click + ' ' + MouseLeave, function() {
                obj.trigger(Cleanup);
                current_obj = !current_obj.is(obj) && current_obj;
            })
            .one(Cleanup, function() {
                obj.off(NameSpace);
                clearTimeout(timeout);
                timeout = null;
            })
            .on(MouseMove, function(e) {
                last_e = e;
            });
    });
});

$.fn.extend({
    hovercard: function(identity, e) {
        if (typeof identity === 'string') {
            identity = network_urls.identify(identity);
        }
        if (!identity) {
            return this;
        }
        var analytics_label = (identity.type === 'url') ? 'url' : identity.api + ' ' + identity.type;
        return this.each(function() {
            $.analytics('send', 'event', 'hovercard displayed', 'link hovered', analytics_label, { nonInteraction: true });
            var start = Date.now();
            var obj = $(this);
            var hovercard_container = $('<div class="' + EXTENSION_ID + '-hovercard-container"></div>');
            var hovercard = $('<div></div>')
                .addClass(EXTENSION_ID + '-hovercard')
                .attr('data-identity-' + EXTENSION_ID, JSON.stringify(identity))
                .text('this is some crap')
                .one(Click, function() {
                    obj.trigger(Cleanup, [1]);
                })
                .addFeedback(obj)
                .appendTo(hovercard_container);
            hovercard_container.appendTo('html');

            var obj_offset = obj.offset();
            var is_top = obj_offset.top - hovercard.height() - PADDING_FROM_EDGES - hovercard.feedback_height() > $(window).scrollTop();
            hovercard_container
                .toggleClass(EXTENSION_ID + '-hovercard-from-top', is_top)
                .toggleClass(EXTENSION_ID + '-hovercard-from-bottom', !is_top)
                .offset({ top:  obj_offset.top + (!is_top && obj.height()),
                          left: Math.max(PADDING_FROM_EDGES,
                                         Math.min($(window).scrollLeft() + $(window).width() - hovercard.width() - PADDING_FROM_EDGES,
                                                  (e ? e.pageX : obj_offset.left) + 1)) });

            var i = 0;
            hovercard.prepend('<div id="count"></div>');
            setInterval(function() {
                hovercard.find('#count').text(i);
                hovercard.append('<div>HoverCard grows! ' + i + '</div>');
                i++;
            }, 100);
            obj
                .one(Click, function() {
                    obj.trigger(Cleanup);
                })
                .one(Cleanup, function(e, keep_hovercard) {
                    $.analytics('send', 'timing', 'hovercard', 'showing', Date.now() - start, analytics_label);
                    if (keep_hovercard) {
                        hovercard
                            .removeClass(EXTENSION_ID + '-hovercard-from-top')
                            .removeClass(EXTENSION_ID + '-hovercard-from-bottom');
                    } else {
                        hovercard_container.remove();
                    }
                    obj.off(NameSpace);
                    current_obj = !current_obj.is(obj) && current_obj;
                });
            var both = obj.add(hovercard);
            both.on(MouseLeave, function(e) {
                var to = $(e.toElement);
                if (both.is(to) || both.has(to).length) {
                    return;
                }
                var kill_timeout = setTimeout(function() { obj.trigger(Cleanup); }, TIMEOUT_BEFORE_FADEOUT);
                both.one(MouseMove, function() {
                    clearTimeout(kill_timeout);
                });
            });
        });
    }
});
