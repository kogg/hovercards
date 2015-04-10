'use strict';

define('embedded-trigger', ['jquery'], function($) {
    var embedded_trigger = {
        on: function(body) {
            body = $(body);
        }
    };

    return embedded_trigger;
});
