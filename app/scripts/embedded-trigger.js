'use strict';

define('embedded-trigger', ['jquery'], function($) {
    var embedded_trigger = {
        on: function(body) {
            body = $(body);
            if (!embedded_trigger.obj) {
                embedded_trigger.obj = $('<div class="hovercards-embedded-trigger"></div>').appendTo(body);
            }
        }
    };

    return embedded_trigger;
});
