'use strict';

define('trigger-inject', ['jquery', 'longpress-trigger'], function($, longpress_trigger) {
    return {
        on: function(inject_into) {
            inject_into = $(inject_into);

            longpress_trigger.on(inject_into, 'a[href]', function(link) {
                return link.attr('href');
            });

            longpress_trigger.on(inject_into, 'a[data-href]', function(link) {
                return link.data('href');
            });

            longpress_trigger.on(inject_into, 'embed[src]', function(embed) {
                return embed.attr('src');
            });

            longpress_trigger.on(inject_into, 'object[data]', function(object) {
                return object.attr('data');
            });

            longpress_trigger.on(inject_into, 'div#player div.html5-video-player div.html5-video-container video.html5-main-video', function() {
                return document.URL;
            });
        }
    };
});
