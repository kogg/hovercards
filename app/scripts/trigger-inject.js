'use strict';

define('trigger-inject', ['jquery', 'longpress-trigger', 'embedded-trigger'], function($, longpress_trigger, embedded_trigger) {
    var trigger_inject = {
        on: function(inject_into) {
            inject_into = $(inject_into);

            longpress_trigger.on(inject_into, 'a[href]', function(link) {
                return trigger_inject.nullify_bad_url(trigger_inject.relative_to_absolute(link.attr('href')));
            });

            longpress_trigger.on(inject_into, 'a[data-href]', function(link) {
                return trigger_inject.nullify_bad_url(trigger_inject.relative_to_absolute(link.data('href')));
            });

            embedded_trigger.on(inject_into, 'embed[src]', function(embed) {
                return trigger_inject.nullify_bad_url(trigger_inject.relative_to_absolute(embed.attr('src')));
            });

            embedded_trigger.on(inject_into, 'object[data]', function(object) {
                return trigger_inject.nullify_bad_url(trigger_inject.relative_to_absolute(object.attr('data')));
            });

            embedded_trigger.on(inject_into, 'div#player div.html5-video-player', function() {
                return document.URL;
            });
        },
        nullify_bad_url: function(url) {
            if (url.match(/^javascript:.*/)) {
                return null;
            }
            return url;
        },
        relative_to_absolute: function(url) {
            var a = document.createElement('a');
            a.href = url;
            url = a.href;
            a.href = '';
            if (a.remove) {
                a.remove();
            }
            return url;
        }
    };

    return trigger_inject;
});
