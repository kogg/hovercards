var $ = require('jquery');

var hovercard = require('./hovercard');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

$(document).on('keydown', function(e) {
    if (e.which !== 27) {
        return;
    }
    window.top.postMessage({ msg: EXTENSION_ID + '-Esc' }, '*');
});

if (document.URL.match(/[&?]noyo=1/)) {
    return;
}

function accept_identity(identity, obj) {
    return identity.api !== document.domain.replace(/\.com$/, '').replace(/^.*\./, '') ||
           (identity.api === 'imgur' && identity.type === 'account' && !obj.is('.account-user-name') && !obj.parents('.options,.user-dropdown').length) ||
           (identity.api === 'instagram' && identity.type === 'account' && !obj.is('.-cx-PRIVATE-Navigation__menuLink') && !obj.parents('.dropdown').length) ||
           (identity.api === 'youtube' && document.URL.indexOf('youtube.com/embed') !== -1) ||
           (identity.api === 'reddit' && (identity.type === 'account' ? !$('body.res').length && !obj.parents('.tabmenu,.user').length :
                                                                        obj.parents('.usertext-body,.search-result-body').length));
}

hovercard('a[href]:not(.no-yo,.hoverZoomLink,[data-href],[data-expanded-url])', function(link) { return link.attr('href'); },         accept_identity);
hovercard('a[data-href]:not(.no-yo,.hoverZoomLink,[data-expanded-url])',        function(link) { return link.data('href'); },         accept_identity);
hovercard('a[data-expanded-url]:not(.no-yo,.hoverZoomLink,[data-href])',        function(link) { return link.data('expanded-url'); }, accept_identity);

// FIXME Twitter follow button hack
hovercard('iframe.twitter-follow-button:not(.no-yo)', function(iframe) {
    var match = iframe.attr('src').match(/[?&]screen_name=([a-zA-Z0-9_]+)(?:&|$)/);
    if (!match || !match[1]) {
        return;
    }
    return 'https://twitter.com/' + match[1];
}, accept_identity);

$('html').on('hovercardclick.' + EXTENSION_ID, function(e, url) {
    window.top.postMessage({ msg: EXTENSION_ID + '-activate', by: 'hovercard', url: url }, '*');
});
/*
var $   = require('jquery');
var URI = require('URIjs/src/URI');

var clickable_yo = require('./clickable-yo');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

function get_center_left_offset(obj, trigger) {
    var offset = obj.offset();
    offset.left = Math.max(0, offset.left - 12);
    offset.top += (obj.height() - trigger.height()) / 2;
    return offset;
}

function get_top_left(obj) {
    var offset = obj.offset();
    offset.left += 7;
    offset.top += 7;
    return offset;
}

function get_top_right(obj, trigger) {
    var offset = obj.offset();
    offset.left += obj.width();
    offset.left -= 7 + trigger.width();
    offset.top += 7;
    return offset;
}

function find_offset_for_link(obj, trigger, e) {
    var target = $(e.target);
    if (target.is('img,video,div.-cx-PRIVATE-PostsGridItem__postInfo') && target.height() > 20) {
        return get_center_left_offset(target, trigger);
    }
    if (e.pageY >= 25) {
        return { left: e.pageX - trigger.width() / 2, top: e.pageY - 25 };
    }
    if (e.pageY + 5 + trigger.height() <= $(window).height()) {
        return { left: e.pageX - trigger.width() / 2, top: e.pageY + 5 };
    }
    if (e.pageX >= trigger.width()) {
        return { left: e.pageX - trigger.width(), top: e.pageY - trigger.height() / 2 };
    }
    return { left: e.pageX, top: e.pageY - trigger.height() / 2 };
}

function find_offset_for_videos(obj, trigger, e, url) {
    var offset = get_top_left(obj);
    var uri = URI(url);
    var showinfo = uri.search(true).showinfo;
    if (uri.domain() !== 'youtube.com' || (showinfo !== undefined && (showinfo === '0' || showinfo === '')) || window.top === window) {
        return offset;
    }
    offset.top += 23;
    return offset;
}

$(document).on('keydown', function(e) {
    if (e.which !== 27) {
        return;
    }
    window.top.postMessage({ msg: EXTENSION_ID + '-Esc' }, '*');
});

if (document.URL.match(/[&?]noyo=1/)) {
    return;
}

clickable_yo('a[href]:not(.no-yo,[data-href][data-expanded-url])', function(link) { return link.attr('href'); },         find_offset_for_link);
clickable_yo('a[data-href]:not(.no-yo,[data-expanded-url])',       function(link) { return link.data('href'); },         find_offset_for_link);
clickable_yo('a[data-expanded-url]:not(.no-yo,[data-href])',       function(link) { return link.data('expanded-url'); }, find_offset_for_link);
clickable_yo('area[href]:not(.no-yo)',                             function(area) { return area.attr('href'); },         find_offset_for_link);
clickable_yo('embed[src]:not(.no-yo)',                             function(embed) { return embed.attr('src'); },        find_offset_for_videos);
clickable_yo('object[data]:not(.no-yo)',                           function(object) { return object.attr('data'); },     find_offset_for_videos);
// TODO Shouldn't be used on not twitter things
clickable_yo('iframe:not(.no-yo,[src])', function(iframe) { return iframe.contents().find('html body blockquote[cite]').attr('cite'); }, find_offset_for_videos);

switch ((document.domain || '').replace(/^www\./, '')) {
    case 'instagram.com':
        if (window.top === window) {
            clickable_yo('.-cx-PRIVATE-Post__media', function(thing) {
                return thing.parents('article').find('a.-cx-PRIVATE-Post__timestamp,a.-cx-PRIVATE-PostInfo__timestamp').attr('href');
            }, get_center_left_offset);
        }
        break;
    case 'twitter.com':
        if (window.top === window) {
            clickable_yo('.permalink-inner,ol.stream-items li.stream-item,ol.stream-items li.js-simple-tweet', function(tweet_container) {
                var tweet = tweet_container.find('.tweet[data-permalink-path]');
                if (tweet.data('retweet-id') && tweet.data('retweeter')) {
                    return '/' + tweet.data('retweeter') + '/status/' + tweet.data('retweet-id');
                }
                return tweet.data('permalink-path');
            }, get_top_right);
            clickable_yo('div.QuoteTweet', function(quote) { return quote.find('div[href]').attr('href'); }, get_top_right);
        }
        break;
    case 'reddit.com':
        // TODO Make these for RES instead for all of reddit
        $(document).on('keydown', function(e) {
            if (e.which !== 86 && e.which !== 186) {
                return;
            }
            var res_active = $('.RES-keyNav-activeElement');
            if (!res_active.length) {
                return;
            }
            var url = res_active.find('.comments,.bylink').attr('href');
            if (!url) {
                return;
            }
            window.top.postMessage({ msg: EXTENSION_ID + '-activate', by: 'res-key(' + e.which + ')', url: url }, '*');
            e.preventDefault();
        });

        $(document).on('keydown', function res_key_help(e) {
            if (e.which !== 16 && e.which !== 191) {
                return;
            }
            var tbody = $('#keyHelp table tbody');
            if (!tbody.length) {
                return;
            }
            $(document).off('keydown', res_key_help);
            $('<tr><td><b>v</b> or <b>;</b></td><td>Toggle <b>HoverCards!</b></td></tr>').prependTo(tbody);
        });

        function res_key_setup() {
            var div = $('<div id="optionContainer-keyboardNav-hovercards" class="optionContainer"></div>').prependTo('#allOptionsContainer');
            $('<label for="hovercards" title="Default: v or ;"><b>hovercards</b></label>').appendTo(div);
            $('<div style="float:left; margin-left: 10px;"><b>v</b> or <b>;</b></div>').appendTo(div);
            $('<div class="optionDescription">Toggle <b>HoverCards</b>!</div>').appendTo(div);
            $('<div class="clear"></div>').appendTo(div);
        }
        if (location.hash === '#!settings/keyboardNav') {
            setTimeout(function() {
                res_key_setup();
            }, 1000);
        }
        $('html').on('click', '#module-keyboardNav', function res_key_click() {
            res_key_setup();
        });
        break;
    case 'youtube.com':
        clickable_yo('div#player div.html5-video-player', function() { return document.URL; }, find_offset_for_videos);
        break;
}

$('html').on(EXTENSION_ID + '-clickable-yo', function(e, url) {
    window.top.postMessage({ msg: EXTENSION_ID + '-activate', by: 'clickable-yo', url: url }, '*');
});
*/
