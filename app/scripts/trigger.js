'use strict';

define('trigger', ['jquery'], function($) {
    function trigger(obj, network, id) {
        return $(obj)
            .data('hovertoast_network', network)
            .data('hovertoast_id', id)
            .click(function() {
                chrome.runtime.sendMessage({ msg: 'interest', interested: true });
            })
            .mouseenter(function() {
                chrome.runtime.sendMessage({ msg: 'pre-load', network: network, id: id });
            })
            .mouseleave(function() {
                chrome.runtime.sendMessage({ msg: 'interest', interested: null });
            });
    }

    return trigger;
});
