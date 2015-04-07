'use strict';

define('trigger-inject', ['jquery', 'hover-trigger'], function($, hover_trigger) {
    return {
        on: function(body) {
            body = $(body);

            hover_trigger.on(body, 'a[href]', function(link) {
                return link.attr('href');
            });

            hover_trigger.on(body, 'a[data-href]', function(link) {
                return link.data('href');
            });

            hover_trigger.on(body, 'embed[src]', function(embed) {
                return embed.attr('src');
            });

            hover_trigger.on(body, 'object[data]', function(object) {
                return object.attr('data');
            });
        }
    };
});
