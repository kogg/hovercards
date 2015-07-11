var $   = require('jquery');
var URI = require('URIjs/src/URI');

var clickable_yo = require('./clickable-yo');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

function find_offset_for_link(obj, trigger, e) {
    var target = $(e.target);
    if (target.is('img') && target.height() > 20) {
        var offset = target.offset();
        offset.left -= 12;
        offset.top += target.height() / 2 - trigger.height() / 2;
        return offset;
    }
    return { left: e.pageX - trigger.width() / 2, top: e.pageY - 25 };
}

clickable_yo('a[href]:not(.no-yo,[data-href][data-expanded-url])', function(link) {
    return link.attr('href');
}, find_offset_for_link);
clickable_yo('div[href]:not(.no-yo)', function(link) {
    return link.attr('href');
}, find_offset_for_link);
clickable_yo('a[data-href]:not(.no-yo,[data-expanded-url])', function(link) {
    return link.data('href');
}, find_offset_for_link);
clickable_yo('a[data-expanded-url]:not(.no-yo,[data-href])', function(link) {
    return link.data('expanded-url');
}, find_offset_for_link);

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

clickable_yo('embed[src]:not(.no-yo)', function(embed) {
    return embed.attr('src');
}, find_offset_for_videos);
clickable_yo('object[data]:not(.no-yo)', function(object) {
    return object.attr('data');
}, find_offset_for_videos);
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
    return iframe.contents().find('html body blockquote[cite]').attr('cite');
}, find_offset_for_videos);
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

$(document).keydown(function(e) {
    if (e.which !== 27) {
        return;
    }
    window.top.postMessage({ msg: 'hide', by: 'Esc' }, '*');
});

$('html').on(EXTENSION_ID + '-clickable-yo', function(e, url) {
    window.top.postMessage({ msg: 'activate', by: 'clickable-yo', url: url }, '*');
});
