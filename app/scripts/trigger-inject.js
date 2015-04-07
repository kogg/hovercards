'use strict';

define('trigger-inject', ['jquery', 'hover-trigger'], function($, hover_trigger) {
    return {
        on: function(body) {
            body = $(body);

            hover_trigger.on(body, 'a[href]', function(link) {
                return link.attr('href');
            });
        }
    };
});
