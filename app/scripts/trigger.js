'use strict';

/* FIXME Why do we have to name this within the file itself? */
define('trigger', ['jquery'], function($) {
    function trigger(obj, content, id) {
        var timeout;
        var confident;
        return $(obj)
            .mouseenter(function() {
                clearTimeout(timeout);
                chrome.runtime.sendMessage({ msg: 'deck', content: content, id: id });
                confident = false;
                timeout = setTimeout(function() {
                    confident = true;
                }, 500);
            })
            .mouseleave(function() {
                if (confident) {
                    return;
                }
                chrome.runtime.sendMessage({ msg: 'undodeck' });
            });
    }

    return trigger;
});
