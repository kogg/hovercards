'use strict';

define('trigger', ['jquery'], function($) {
    function trigger(obj, content, id) {
        return $(obj)
            .data('hovertoast_content', content)
            .data('hovertoast_id', id)
            .mouseenter(function() {
                chrome.runtime.sendMessage({ msg: 'triggered', content: content, id: id });
            })
            .mouseleave(function() {
                chrome.runtime.sendMessage({ msg: 'untriggered' });
            });
    }

    return trigger;
});
