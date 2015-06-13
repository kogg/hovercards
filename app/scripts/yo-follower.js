var $            = require('jquery');
var network_urls = require('YoCardsApiCalls/network-urls');

var extension_id = chrome.i18n.getMessage('@@extension_id');

var follow_hover = function(e, obj) {
    obj = $(obj);
    var offset = obj.offset();
    window.top.postMessage({ msg:        'yo-follower-hover',
                             mouse:  { x: e.clientX, y: e.clientY },
                             object: { top:    offset.top,
                                       bottom: offset.top + obj.outerHeight(),
                                       left:   offset.left,
                                       right:  offset.left + obj.outerWidth() } }, '*');
};

module.exports = function(body, selector, get_url) {
    body = $(body);

    var follower = body.data(extension_id + '-yo-follower');
    if (!follower) {
        follower = $('<div></div>')
            .appendTo(body)
            .addClass(extension_id + '-yo-follower')
            .hide();

        var toggle = function(state) {
            if (state) {
                follower.show();
            }
            follower
                .toggleClass(extension_id + '-yo-follower-enter', state)
                .toggleClass(extension_id + '-yo-follower-exit', !state)
                .removeClass(extension_id + '-yo-follower-longpressed');
        };

        var timeout;

        var mousemove = function(e) {
            follower
                .css('left', e.clientX - 10)
                .css('top',  e.clientY + 15);
        };

        var longpress = function() {
            toggle(true);
            follower
                .removeClass(extension_id + '-yo-follower-exit')
                .addClass(extension_id + '-yo-follower-longpressed');
            body.off('mousemove', mousemove);
            clearTimeout(timeout);
        };

        body.data(extension_id + '-yo-follower-enter', function(e, identity) {
            body.on('mousemove', mousemove);
            $(e.currentTarget).on('longpress', longpress);
            if (follower.api) {
                follower.removeClass(extension_id + '-yo-follower-' + follower.api);
            }
            if (identity && identity.api) {
                follower.api = identity.api;
                follower.addClass(extension_id + '-yo-follower-' + follower.api);
            }
            timeout = setTimeout(function() {
                toggle(true);
                timeout = setTimeout(function() {
                    toggle(false);
                }, 2000);
            }, 400);
            return follower;
        });

        body.data(extension_id + '-yo-follower-leave', function(e) {
            toggle(false);
            clearTimeout(timeout);
            $(e.currentTarget).off('longpress', longpress);
            return follower;
        });

        follower.on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
            if (e.originalEvent.animationName !== extension_id + '-yo-follower-fadeout' && e.originalEvent.animationName !== extension_id + '-yo-follower-growfade') {
                return;
            }
            follower.hide();
        });

        toggle(false);

        body.data(extension_id + '-yo-follower', follower);
    }
    var enter = body.data(extension_id + '-yo-follower-enter');
    var leave = body.data(extension_id + '-yo-follower-leave');

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
        follow_hover(e, obj);
    });
};
