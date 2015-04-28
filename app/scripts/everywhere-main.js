var $                 = require('jquery');
var embedded_trigger  = require('./embedded-trigger');
var longpress_trigger = require('./longpress-trigger');

function sendMessage(msg) {
    window.top.postMessage(msg, '*');
}

function nullify_bad_url(url) {
    if (url.match(/^javascript:.*/)) {
        return null;
    }
    return url;
}

function relative_to_absolute(url) {
    var a = document.createElement('a');
    a.href = url;
    url = a.href;
    a.href = '';
    if (a.remove) {
        a.remove();
    }
    return url;
}

var html = $('html');

longpress_trigger.on(html, 'a[href]', function(link) {
    return nullify_bad_url(relative_to_absolute(link.attr('href')));
}, sendMessage);

longpress_trigger.on(html, 'a[data-href]', function(link) {
    return nullify_bad_url(relative_to_absolute(link.data('href')));
}, sendMessage);

embedded_trigger(html, 'embed[src]', function(embed) {
    return nullify_bad_url(relative_to_absolute(embed.attr('src')));
}, sendMessage);

embedded_trigger(html, 'object[data]', function(object) {
    return nullify_bad_url(relative_to_absolute(object.attr('data')));
}, sendMessage);

embedded_trigger(html, 'div#player div.html5-video-player', function() {
    return document.URL;
}, sendMessage, true);
