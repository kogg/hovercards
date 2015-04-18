'use strict';

define('click-trigger', ['jquery'], function($) {
    var embedded_trigger = {
        on: function(body, selector, get_url) {
            body = $(body);
            body.on('click', selector, function() {
                var url = get_url($(this));
                if (!url) {
                    return;
                }
                chrome.runtime.sendMessage({ msg: 'activate', url: url });
            });
        }
    };

    return embedded_trigger;
});
