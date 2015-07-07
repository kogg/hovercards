var $   = require('jquery');
var URI = require('URIjs/src/URI');

var clickable_yo = require('./clickable-yo');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

function find_offset_for_link(obj, trigger) {
    if (!(obj.text() || '').replace(/(?:^\s+)|(?:\s+$)/, '').length) {
        console.log('no text');
        return obj.offset();
    } else {
        var img = obj.find('img').filter(function() { return $(this).height() > 20; }).first();
        if (img.length) {
            console.log('img', img);
            return img.offset();
        } else {
            console.log('text');
            var offset;
            offset = obj.offset();
            offset.left -= trigger.width();
            return offset;
        }
    }
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

function find_offset_for_videos(obj, trigger, url) {
    var showinfo = URI(url).search(true).showinfo;
    if (showinfo !== undefined && (showinfo === '0' || showinfo === '')) {
        console.log('dont move');
        return obj.offset();
    }
    var offset;
    offset = obj.offset();
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
    return iframe.attr('src');
}, find_offset_for_videos);
clickable_yo('iframe:not(.no-yo,[src])', function(iframe) {
    return iframe.contents().find('html body blockquote[cite]').attr('cite');
}, find_offset_for_videos);
if (window.top === window) {
    clickable_yo('div#player div.html5-video-player', function() {
        return document.URL;
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
