var $                = require('jquery');
var common           = require('./common');
var embedded_trigger = require('./embedded-trigger');
var longpress        = require('./longpress');

function sendMessage(msg) {
    window.top.postMessage(msg, '*');
}

var html = $('html');

longpress(html, 'a[href]:not([data-href])', function(link) {
    return common.nullify_bad_url(common.relative_to_absolute(link.attr('href')));
}, sendMessage);

longpress(html, 'a[data-href]', function(link) {
    return common.nullify_bad_url(common.relative_to_absolute(link.data('href')));
}, sendMessage);

html.on('longpress', function(e, url) {
    window.top.postMessage({ msg: 'activate', url: url }, '*');
});

embedded_trigger(html, 'embed[src]', function(embed) {
    return common.nullify_bad_url(common.relative_to_absolute(embed.attr('src')));
}, sendMessage);

embedded_trigger(html, 'object[data]', function(object) {
    return common.nullify_bad_url(common.relative_to_absolute(object.attr('data')));
}, sendMessage);

embedded_trigger(html, 'div#player div.html5-video-player', function() {
    return document.URL;
}, sendMessage, true);
