var $            = require('jquery');
var network_urls = require('YoCardsApiCalls/network-urls');

module.exports = function(body, selector, get_url) {
    body = $(body);

    body.on('mouseenter', selector, function(e) {
        var obj = $(this);
        if (obj.data('has-yo')) {
            return;
        }

        var url = get_url(obj);
        if (!url) {
            return;
        }

        var identity = network_urls(url);
        if (!identity) {
            return;
        }

        var create_trigger_timeout = setTimeout(function() {
            obj.data('has-yo', true);

            var remove_trigger_timeout;
            var trigger = $('<div class="yo-notify"></div>')
                .appendTo(body)
                .addClass('yo-notify-' + identity.api)
                .offset({ left: e.pageX - 8, top: obj.offset().top - 15 })
                .click(function() {
                    trigger.trigger('yo', [url]);
                    trigger.addClass('yo-notify-clicked');
                })
                .hover(function() {
                    clearTimeout(remove_trigger_timeout);
                    trigger.removeClass('yo-notify-exit');
                }, function() {
                    remove_trigger_timeout = setTimeout(function() {
                        trigger.addClass('yo-notify-exit');
                    }, 2000);
                })
                .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                    if (e.originalEvent.animationName !== 'yofadeOut' && e.originalEvent.animationName !== 'yohasbeenpressedlol') {
                        return;
                    }
                    clearTimeout(remove_trigger_timeout);
                    trigger.remove();
                    obj.data('has-yo', false);
                });

            remove_trigger_timeout = setTimeout(function() {
                trigger.addClass('yo-notify-exit');
            }, 2000);
        }, 500);

        obj.one('mouseleave', function() {
            clearTimeout(create_trigger_timeout);
        });
    });
};
