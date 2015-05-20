var $            = require('jquery');
var network_urls = require('YoCardsApiCalls/network-urls');

var extension_id = chrome.i18n.getMessage('@@extension_id');

module.exports = function(body, selector, get_url) {
    body = $(body);

    var follower = body.data(extension_id + '-yo-follower');
    if (!follower) {
        follower = $('<div></div>')
            .appendTo(body)
            .addClass(extension_id + '-yo-follower')
            .hide();

        var setIdentity = function(identity) {
            if (follower.api) {
                follower.removeClass(extension_id + '-yo-follower-' + follower.api);
            }
            if (identity && identity.api) {
                follower.api = identity.api;
                follower.addClass(extension_id + '-yo-follower-' + follower.api);
            }
        };

        var toggle = function(state) {
            if (state) {
                follower.show();
            }
            follower
                .toggleClass(extension_id + '-yo-follower-enter', state)
                .toggleClass(extension_id + '-yo-follower-exit', !state)
                .removeClass(extension_id + '-yo-follower-longpressed');
        };

        var over_object = false;
        var timeout;

        var mousemove = function(e) {
            follower
                .css('left', e.pageX - 10)
                .css('top',  e.pageY + 15);
            if (over_object) {
                toggle(true);
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    toggle(false);
                }, 2000);
            }
        };

        var longpress = function() {
            toggle(true);
            follower
                .removeClass(extension_id + '-yo-follower-exit')
                .addClass(extension_id + '-yo-follower-longpressed');
            clearTimeout(timeout);
        };

        var enter = function(e, identity) {
            over_object = true;
            setIdentity(identity);
            mousemove(e);
            body.on('mousemove', mousemove);
            body.on('scroll', mousemove);
            $(e.currentTarget).on('longpress', longpress);
            return follower;
        };

        var leave = function(e) {
            over_object = false;
            toggle(false);
            $(e.currentTarget).off('longpress', longpress);
            return follower;
        };

        follower.on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
            if (e.originalEvent.animationName !== extension_id + '-yo-follower-fadeout' && e.originalEvent.animationName !== extension_id + '-yo-follower-growfade') {
                return;
            }
            if (!over_object) {
                body.off('mousemove', mousemove);
                body.off('scroll', mousemove);
            }
            follower.hide();
        });

        toggle(false);

        body.data(extension_id + '-yo-follower', follower);
    }

    body.on('mouseenter', selector, function(e) {
        var obj = $(this);

        var url = get_url(obj);
        if (!url) {
            return;
        }
        var identity = network_urls.identify(url);
        if (!identity) {
            return;
        }

        enter(e, identity);
        obj.one('mouseleave', leave);
    });
};
