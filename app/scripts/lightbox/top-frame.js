var $ = require('jquery');
require('./common');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Click         = 'click' + NameSpace;
var Keydown       = 'keydown' + NameSpace;
var Scroll        = 'scroll' + NameSpace;
var TransitionEnd = 'transitionend' + NameSpace;

var $top = $('html,body');

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
        lightbox
            .css('height', lightbox.height() + 1)
            .css('width', lightbox.width() + 1);
    } else {
        lightbox_container = $('<div></div>')
            .css('height', '0')
            .css('width', '0')
            .css('top', window_scroll.top + $(window).height() / 2)
            .css('left', window_scroll.left + $(window).width() / 2)
            .appendTo('html');
        lightbox = $('<div></div>')
            .text('this is some other crap')
            .css('height', '0')
            .css('width', '0')
            .appendTo(lightbox_container);
    }
    setTimeout(function() {
        lightbox_container
            .addClass(EXTENSION_ID + '-lightbox-container')
            .css('height', '100%')
            .css('width', '100%')
            .css('top', window_scroll.top)
            .css('left', window_scroll.left);
        var clone = lightbox.clone().addClass(EXTENSION_ID + '-lightbox').appendTo('html');
        lightbox
            .addClass(EXTENSION_ID + '-lightbox')
            .css('height', clone.height() + 1)
            .css('width', clone.width() + 1)
            .on(TransitionEnd, function clear_height(e) {
                if (e.originalEvent.propertyName !== 'height') {
                    return;
                }
                lightbox
                    .off(TransitionEnd, clear_height)
                    .css('height', '');
            })
            .on(TransitionEnd, function clear_width(e) {
                if (e.originalEvent.propertyName !== 'width') {
                    return;
                }
                lightbox
                    .off(TransitionEnd, clear_width)
                    .css('width', '');
            });
        clone.remove();
    });

    $(document).on(Keydown, lightbox_backdrop_leave);
    $(window).one(Scroll, lightbox_backdrop_leave);
    lightbox_backdrop.one(Click, lightbox_backdrop_leave);
    function lightbox_backdrop_leave(e) {
        if (e.type === 'keydown') {
            if (e.which !== 27) {
                return;
            }
        }
        $(document).off(Keydown, lightbox_backdrop_leave);
        $(window).off(Scroll, lightbox_backdrop_leave);
        lightbox_backdrop.off(Click, lightbox_backdrop_leave);

        lightbox.toggleAnimationClass(EXTENSION_ID + '-lightbox-leave', function() {
            lightbox_container.remove();
        });
        lightbox_backdrop.toggleAnimationClass(EXTENSION_ID + '-lightbox-backdrop-leave', function() {
            lightbox_backdrop.remove();
        });
    }
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
