'use strict';

define('trigger', ['jquery'], function($) {
    function trigger(obj, content, id) {
        return $(obj)
            .data('hovertoast_content', content)
            .data('hovertoast_id', id)
            .mouseenter(function() {
                chrome.runtime.sendMessage({ msg: 'pre-load', content: content, id: id });
            })
            .mouseleave(function() {
                chrome.runtime.sendMessage({ msg: 'interest', interested: null });
            });
    }

    return trigger;
});
