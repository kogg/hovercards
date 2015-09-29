var $            = require('jquery');
var network_urls = require('YoCardsApiCalls/network-urls');
require('./common');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Click         = 'click' + NameSpace;
var Keydown       = 'keydown' + NameSpace;
var Scroll        = 'scroll' + NameSpace;
var TransitionEnd = 'transitionend' + NameSpace;

$.fn.extend({
    toggleAnimationClass: function(className, callback) {
        return this
            .addClass(className)
            .on('animationend', function animationend(e) {
                if (e.originalEvent.animationName !== className + '-animation') {
                    return;
                }
                $(this)
                    .off('animationend', animationend)
                    .removeClass(className);
                (callback || $.noop)();
            });
    }
});

$.lightbox = function(identity, hovercard) {
    if (typeof identity === 'string') {
        identity = network_urls.identify(identity);
    }
    if (!identity) {
        return this;
    }
    var analytics_label = (identity.type === 'url') ? 'url' : identity.api + ' ' + identity.type;
    $.analytics('send', 'event', 'lightbox displayed', 'hovercard clicked', analytics_label, { nonInteraction: true });
    var start = Date.now();

    var lightbox_backdrop = $('<div class="' + EXTENSION_ID + '-lightbox-backdrop"></div>').appendTo('html');
    var lightbox_container;
    var lightbox;
    var window_scroll = { top: $(window).scrollTop(), left: $(window).scrollLeft() };
    if (hovercard) {
        lightbox_container = hovercard.parent();
        lightbox = hovercard;
        lightbox_container
            .css('height', lightbox_container.height() + 1)
            .css('width', lightbox_container.width() + 1);
    } else {
        lightbox_container = $('<div></div>')
            .css('height', '0')
            .css('width', '0')
            .css('top', window_scroll.top + $(window).height() / 2)
            .css('left', window_scroll.left + $(window).width() / 2)
            .appendTo('html');
        lightbox = $('<div></div>')
            .text('this is some other crap')
            .appendTo(lightbox_container);
    }
    setTimeout(function() {
        lightbox_container
            .addClass(EXTENSION_ID + '-lightbox-container')
            .css('height', '100%')
            .css('width', '100%')
            .css('top', window_scroll.top)
            .css('left', window_scroll.left)
            .on(TransitionEnd, function set_overflow(e) {
                if (e.originalEvent.propertyName !== 'height') {
                    return;
                }
                lightbox_container
                    .off(TransitionEnd, set_overflow)
                    .css('overflow', 'auto');
            });
        var clone = lightbox.clone().addClass(EXTENSION_ID + '-lightbox').appendTo('html');
        lightbox.addClass(EXTENSION_ID + '-lightbox');
        clone.remove();
    });

    function stop_propagation(e) {
        e.stopPropagation();
    }
    function lightbox_leave(e) {
        if (e.type === 'keydown') {
            if (e.which !== 27) {
                return;
            }
        }
        $.analytics('send', 'timing', 'lightbox', 'showing', Date.now() - start, analytics_label);

        lightbox.toggleAnimationClass(EXTENSION_ID + '-lightbox-leave', function() {
            lightbox_container.remove();
        });
        lightbox_backdrop.toggleAnimationClass(EXTENSION_ID + '-lightbox-backdrop-leave', function() {
            lightbox_backdrop.remove();
        });

        lightbox.off(Click, stop_propagation);
        $(document).off(Keydown, lightbox_leave);
        $(window).off(Scroll, lightbox_leave);
        lightbox_container.off(Click, lightbox_leave);
    }
    lightbox.on(Click, stop_propagation);
    $(document).on(Keydown, lightbox_leave);
    $(window).one(Scroll, lightbox_leave);
    lightbox_container.one(Click, lightbox_leave);
};

window.addEventListener('message', function(event) {
    if (!event || !event.data) {
        return;
    }
    var message = event.data;
    if (message.msg !== EXTENSION_ID + '-lightbox') {
        return;
    }
    $.lightbox(message.identity, message.obj);
});
