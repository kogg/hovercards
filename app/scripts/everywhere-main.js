var $                = require('jquery');
var common           = require('./common');
var embedded_trigger = require('./embedded-trigger');
var longpress        = require('./longpress');
var yo_trigger       = require('./yo-trigger');

$(document).keydown(function(e) {
    if (e.which !== 27) {
        return;
    }
    window.top.postMessage({ msg: 'hide' }, '*');
});

var extension_id = chrome.i18n.getMessage('@@extension_id');

var html = $('html');

longpress(html, 'a[href]:not([data-href])', function(link) {
    return common.nullify_bad_url(common.relative_to_absolute(link.attr('href')));
});

longpress(html, 'a[data-href]', function(link) {
    return common.nullify_bad_url(common.relative_to_absolute(link.data('href')));
});

yo_trigger(html, 'a[href]:not([data-href]):not(.no-yo)', function(link) {
    return common.nullify_bad_url(common.relative_to_absolute(link.attr('href')));
});

yo_trigger(html, 'a[data-href]:not(.no-yo)', function(link) {
    return common.nullify_bad_url(common.relative_to_absolute(link.attr('href')));
});

embedded_trigger(html, 'embed[src]:not(.no-yo)', { top: 32, left: 8 }, function(embed) {
    return common.nullify_bad_url(common.relative_to_absolute(embed.attr('src')));
});

embedded_trigger(html, 'object[data]:not(.no-yo)', { top: 32, left: 8 }, function(object) {
    return common.nullify_bad_url(common.relative_to_absolute(object.attr('data')));
});

embedded_trigger(html, 'div#player div.html5-video-player', { top: 32, left: 8 }, function() {
    return document.URL;
});

if (window.top !== window) {
    embedded_trigger(html, 'body', { top: 8, left: 8 }, function() {
        return (document.URL.indexOf('redditmedia.com') !== -1) && document.URL;
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
