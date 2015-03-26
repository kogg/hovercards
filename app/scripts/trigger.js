'use strict';

/* FIXME Why do we have to name this within the file itself? */
define('trigger', ['jquery'], function($) {
    function trigger(obj, content, id) {
        return $(obj)
            .mouseenter(function() {
                chrome.runtime.sendMessage({ msg: 'trigger', content: content, id: id });
            })
            .mouseleave(function() {
                chrome.runtime.sendMessage({ msg: 'untrigger' });
            });
    }

    return trigger;
});
