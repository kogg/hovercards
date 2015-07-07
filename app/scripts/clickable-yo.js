var $ = require('jquery');

var common       = require('./common');
var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = function(selector, get_url, offset) {
    $('html').on('mouseenter', selector, function() {
        var obj = $(this);
        if (obj.data(EXTENSION_ID + '-has-trigger')) {
            return;
        }
        var url = common.massage_url(get_url(obj));
        if (!url) {
            return;
        }
        var identity = network_urls.identify(url);
        if (!identity) {
            return;
        }

        obj.data(EXTENSION_ID + '-has-trigger', true);
        var trigger = $('<div></div>')
            .appendTo('html')
            .addClass(EXTENSION_ID + '-clickable-yo-trigger')
            .addClass(EXTENSION_ID + '-clickable-yo-trigger-' + identity.api)
            .show();

        if (!offset) {
            trigger.offset(obj.offset());
        } else {
            trigger.offset(offset(obj, trigger, url));
        }

        var mouseleave = function(e) {
            var from = $(this);
            var okay_to = $((from[0] === trigger[0]) ? obj : trigger);
            var to = $(e.toElement);
            if (to.is(okay_to) || $.contains(to, okay_to) || $.contains(okay_to, to)) {
                return;
            }
            obj.data(EXTENSION_ID + '-has-trigger', false);
            trigger.off('mouseleave', mouseleave);
            obj.off('mouseleave', mouseleave);
            trigger.hide();
            trigger.remove();
        };
        trigger.on('mouseleave', mouseleave);
        obj.on('mouseleave', mouseleave);
        trigger.on('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            trigger.trigger(EXTENSION_ID + '-clickable-yo', [url]);
        });
    });
};
