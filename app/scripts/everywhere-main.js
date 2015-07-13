var $   = require('jquery');
var URI = require('URIjs/src/URI');

var clickable_yo = require('./clickable-yo');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

function get_left_center_offset(obj, trigger) {
    var offset = obj.offset();
    offset.left -= 12;
    offset.top += (obj.height() - trigger.height()) / 2;
    return offset;
}

function find_offset_for_link(obj, trigger, e) {
    var target = $(e.target);
    if (target.is('img,div.-cx-PRIVATE-PostsGridItem__postInfo') && target.height() > 20) {
        return get_left_center_offset(target, trigger);
    }
    return { left: e.pageX - trigger.width() / 2, top: e.pageY - 25 };
}

function find_offset_for_videos(obj, trigger, e, url) {
    var offset = obj.offset();
    offset.left += 7;
    var uri = URI(url);
    var showinfo = uri.search(true).showinfo;
    if (obj.attr('src') === 'https://s-static.ak.facebook.com/common/referer_frame.php') {
    } else if (uri.domain() !== 'youtube.com' || (showinfo !== undefined && (showinfo === '0' || showinfo === ''))) {
        offset.top += 7;
        return offset;
    }
    offset.top += 30;
    return offset;
}

clickable_yo('a[href]:not(.no-yo,[data-href][data-expanded-url])', function(link) { return link.attr('href'); },         find_offset_for_link);
clickable_yo('a[data-href]:not(.no-yo,[data-expanded-url])',       function(link) { return link.data('href'); },         find_offset_for_link);
clickable_yo('a[data-expanded-url]:not(.no-yo,[data-href])',       function(link) { return link.data('expanded-url'); }, find_offset_for_link);
clickable_yo('embed[src]:not(.no-yo)',                             function(embed) { return embed.attr('src'); },        find_offset_for_videos);
clickable_yo('object[data]:not(.no-yo)',                           function(object) { return object.attr('data'); },     find_offset_for_videos);
clickable_yo('iframe[src]:not(.no-yo)', function(iframe) {
    if (iframe.attr('src') === 'https://s-static.ak.facebook.com/common/referer_frame.php') {
        var facebook_iframe = iframe.parentsUntil('.exploded', '.clearfix').find('.mbs a').attr('href');
        if (facebook_iframe) {
            return facebook_iframe;
        }
    }
    return iframe.attr('src');
}, find_offset_for_videos);
clickable_yo('iframe:not(.no-yo,[src])', function(iframe) {
    // TODO Shouldn't be used on not twitter things
    return iframe.contents().find('html body blockquote[cite]').attr('cite');
}, find_offset_for_videos);

switch ((document.domain || '').replace(/^www\./, '')) {
    case 'instagram.com':
        clickable_yo('.-cx-PRIVATE-Post__media', function(thing) {
            return thing.parents('article').find('a.-cx-PRIVATE-Post__timestamp,a.-cx-PRIVATE-PostInfo__timestamp').attr('href');
        }, get_left_center_offset);
        break;
    case 'twitter.com':
        clickable_yo('.permalink-inner,ol.stream-items li.stream-item,ol.stream-items li.js-simple-tweet',
                     function(li) { return li.find('.tweet[data-permalink-path]').data('permalink-path'); },
                     get_left_center_offset);
        clickable_yo('div.QuoteTweet', function(quote) { return quote.find('div[href]').attr('href'); },                       get_left_center_offset);
        break;
    case 'youtube.com':
        if (window.top === window) {
            clickable_yo('div#player div.html5-video-player', function() {
                return document.URL;
            }, function(obj) {
                var offset = obj.offset();
                offset.left += 7;
                offset.top += 7;
                return offset;
            });
        }
        break;
}

$(document).keydown(function(e) {
    if (e.which !== 27) {
        return;
    }
    window.top.postMessage({ msg: 'hide', by: 'Esc' }, '*');
});

$('html').on(EXTENSION_ID + '-clickable-yo', function(e, url) {
    window.top.postMessage({ msg: 'activate', by: 'clickable-yo', url: url }, '*');
});
