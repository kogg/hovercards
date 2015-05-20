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
            .hide()
            .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                if (e.originalEvent.animationName !== extension_id + '-yo-follower-fadeout') {
                    return;
                }
                body.off('mousemove', follower.follow);
                body.off('scroll', follower.follow);
                follower
                    .setIdentity(null)
                    .hide();
            });
        follower.follow = function(e) {
            follower
                .css('left', e.pageX - 10)
                .css('top',  e.pageY + 15);
            return follower;
        };
        follower.setIdentity = function(identity) {
            if (follower.api) {
                follower.removeClass(extension_id + '-yo-follower-' + follower.api);
            }
            if (identity && identity.api) {
                follower.api = identity.api;
                follower.addClass(extension_id + '-yo-follower-' + follower.api);
            }
            return follower;
        };
        follower.toggleClasses = function(state, identity) {
            follower
                .toggleClass(extension_id + '-yo-follower-enter', state)
                .toggleClass(extension_id + '-yo-follower-exit', !state);
            follower.setIdentity(identity);
            return follower;
        };
        follower.toggleClasses(false);
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

        follower
            .show()
            .toggleClasses(true)
            .setIdentity(identity)
            .follow(e);
        body.on('mousemove', follower.follow);
        body.on('scroll', follower.follow);
        obj.one('mouseleave', function() {
            follower.toggleClasses(false, identity);
        });
    });
};
