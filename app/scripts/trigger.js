'use strict';

define('trigger', ['jquery'], function($) {
    function trigger(obj, content, id) {
        return $(obj)
            .mouseenter(function() {
                chrome.runtime.sendMessage({ msg: 'triggered', content: content, id: id });
            })
            .mouseleave(function() {
                chrome.runtime.sendMessage({ msg: 'untriggered' });
            });
    }

    return trigger;
});
