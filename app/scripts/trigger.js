'use strict';

/* FIXME Why do we have to name this within the file itself? */
define('trigger', ['jquery'], function($) {
    function trigger(obj, content, id) {
        var timeout;
        return $(obj)
            .mouseenter(function() {
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    chrome.runtime.sendMessage({ msg: 'deck', content: content, id: id });
                }, 500);
            })
            .mouseleave(function() {
                clearTimeout(timeout);
            });
    }

    return trigger;
});
