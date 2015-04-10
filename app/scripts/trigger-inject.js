'use strict';

define('trigger-inject', ['jquery', 'hover-trigger'], function($, hover_trigger) {
    return {
        on: function(inject_into) {
            inject_into = $(inject_into);

            hover_trigger.on(inject_into, 'a[href]', function(link) {
                return link.attr('href');
            });

            hover_trigger.on(inject_into, 'a[data-href]', function(link) {
                return link.data('href');
            });

            hover_trigger.on(inject_into, 'embed[src]', function(embed) {
                return embed.attr('src');
            });

            hover_trigger.on(inject_into, 'object[data]', function(object) {
                return object.attr('data');
            });

            hover_trigger.on(inject_into, 'div#player div.html5-video-player div.html5-video-container video.html5-main-video', function() {
                return document.URL;
            });
        }
    };
});
