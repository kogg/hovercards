var $            = require('jquery');
var network_urls = require('YoCardsApiCalls/network-urls');

var extension_id = chrome.i18n.getMessage('@@extension_id');

module.exports = function(body, selector, offset, get_url) {
    body = $(body);

    body.on('mousemove', selector, function () {
        var obj = $(this);
        var trigger;
        if (obj.data(extension_id + '-yo-trigger')) {
            trigger = obj.data(extension_id + '-yo-trigger');
            clearTimeout(trigger.data(extension_id + '-yo-trigger-timeout'));
            trigger.data(extension_id + '-yo-trigger-timeout', setTimeout(function() {
                trigger.addClass(extension_id + '-yo-notify-exit');
            }, 3000));
            return;
        }

        var url = get_url(obj);
        if (!url) {
            return;
        }

        var identity = network_urls.identify(url);
        if (!identity) {
            return;
        }

        var obj_offset = obj.offset();

        obj.data(extension_id + '-yo-trigger', trigger = $('<div></div>')
            .appendTo(body)
            .addClass(extension_id + '-yo-notify')
            .addClass(extension_id + '-yo-notify-embedded')
            .addClass(extension_id + '-yo-notify-' + identity.api)
            .offset({ top: obj_offset.top + offset.top, left: obj_offset.left + offset.left })
            .click(function() {
                trigger.trigger('yo', [url]);
                trigger.addClass(extension_id + '-yo-notify-clicked');
            })
            .mouseenter(function() {
                clearTimeout(trigger.data(extension_id + '-yo-trigger-timeout'));
                trigger
                    .removeData(extension_id + '-yo-trigger-timeout')
                    .addClass(extension_id + '-yo-notify-hover')
                    .removeClass(extension_id + '-yo-notify-exit');
            })
            .mouseleave(function() {
                trigger.removeClass(extension_id + '-yo-notify-hover');
                clearTimeout(trigger.data(extension_id + '-yo-trigger-timeout'));
                trigger.data(extension_id + '-yo-trigger-timeout', setTimeout(function() {
                    trigger.addClass(extension_id + '-yo-notify-exit');
                }, 3000));
            })
            .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                if (e.originalEvent.animationName !== extension_id + '-yo-notify-fadeout' && e.originalEvent.animationName !== extension_id + '-yo-notify-grow') {
                    return;
                }
                clearTimeout(trigger.data(extension_id + '-yo-trigger-timeout'));
                trigger.remove();
                obj.removeData(extension_id + '-yo-trigger');
            }));
        trigger.data(extension_id + '-yo-trigger-timeout', setTimeout(function() {
            trigger.addClass(extension_id + '-yo-notify-exit');
        }, 3000));
    });

    body.on('mouseleave', selector, function (e) {
        var obj = $(this);
        if (!obj.data(extension_id + '-yo-trigger')) {
            return;
        }
        var trigger = obj.data(extension_id + '-yo-trigger');
        var to_element = e.toElement || e.relatedTarget;
        if (trigger.is(to_element) || trigger.find(to_element).length) {
            return;
        }
        clearTimeout(trigger.data(extension_id + '-yo-trigger-timeout'));
        trigger.removeData(extension_id + '-yo-trigger-timeout');
        trigger.addClass(extension_id + '-yo-notify-exit');
    });
};
