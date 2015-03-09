'use strict';

define('trigger', ['jquery'], function($) {
    function trigger(obj, network, id) {
        return $(obj)
            .data('deckard_network', network)
            .data('deckard_id', id)
            .click(function() {
                chrome.runtime.sendMessage({ msg: 'interest', key: 'confidence', value: 'sure' });
            })
            .mouseenter(function() {
                chrome.runtime.sendMessage({ msg: 'info', key: network, value: id });
            })
            .mouseleave(function() {
                chrome.runtime.sendMessage({ msg: 'interest', key: 'confidence', value: 'unsure' });
            });
    }

    return trigger;
});
