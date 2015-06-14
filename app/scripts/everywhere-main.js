var $                = require('jquery');
var common           = require('./common');
var embedded_trigger = require('./embedded-trigger');
var longpress        = require('./longpress');
var yo_follower      = require('./yo-follower');

$(document).keydown(function(e) {
    if (e.which !== 27) {
        return;
    }
    window.top.postMessage({ msg: 'hide' }, '*');
});

var extension_id = chrome.i18n.getMessage('@@extension_id');

var html = $('html');

longpress(html, 'a[href]:not([data-href],[data-expanded-url])', function(link) {
    return common.massage_url(link.attr('href'));
});

longpress(html, 'a[data-href]', function(link) {
    return common.massage_url(link.data('href'));
});

longpress(html, 'a[data-expanded-url]', function(link) {
    return common.massage_url(link.data('expanded-url'));
});

yo_follower(html, 'a[href]:not([data-href],[data-expanded-url],.no-yo)', function(link) {
    return common.massage_url(link.attr('href'));
});

yo_follower(html, 'a[data-href]:not(.no-yo)', function(link) {
    return common.massage_url(link.data('href'));
});

yo_follower(html, 'a[data-expanded-url]:not(.no-yo)', function(link) {
    return common.massage_url(link.data('expanded-url'));
});

embedded_trigger(html, html, 'embed[src]:not(.no-yo)', { top: 32, left: 8 }, function(embed) {
    return common.massage_url(embed.attr('src'));
});

embedded_trigger(html, html, 'object[data]:not(.no-yo)', { top: 32, left: 8 }, function(object) {
    return common.massage_url(object.attr('data'));
});

embedded_trigger(html, html, 'div#player div.html5-video-player', { top: 32, left: 8 }, function() {
    return document.URL;
});

/* Twitter Embeds */
$(document).ready(function () {
    $('iframe.twitter-tweet:not([src])').each(function() {
        var offset = $(this).offset();
        offset.top += 8;
        offset.left += 8;
        embedded_trigger($(this).contents().find('html'), html, 'body', offset, function(iframe_body) {
            return iframe_body.find('blockquote').attr('cite');
        });
    });
});

if (window.top !== window) {
    embedded_trigger(html, html, 'body', { top: 8, left: 8 }, function() {
        return (document.URL.indexOf('youtube.com') === -1 && document.URL.indexOf('youtu.be') === -1) && document.URL;
    });
}

html.on('longpress', function(e, url) {
    window.top.postMessage({ msg: 'activate', url: url }, '*');
    var trigger = $(e.target).data(extension_id + '-yo-trigger');
    if (trigger) {
        trigger.addClass(extension_id + '-yo-notify-clicked');
        clearTimeout(trigger.data(extension_id + '-yo-trigger-timeout'));
    }
});

html.on('yo', function(e, url) {
    window.top.postMessage({ msg: 'activate', url: url }, '*');
});
