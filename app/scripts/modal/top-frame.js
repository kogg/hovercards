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

$.modal = function(identity, hovercard) {
    var modal_backdrop = $('<div class="' + EXTENSION_ID + '-modal-backdrop"></div>').appendTo('html');

    var modal_container;
    var modal;
    var window_scroll = { top: $(window).scrollTop(), left: $(window).scrollLeft() };
    if (hovercard) {
        modal_container = hovercard.parent();
        modal = hovercard;
        modal_container
            .css('height', modal_container.height() + 1)
            .css('width', modal_container.width() + 1);
        modal
            .css('height', modal.height() + 1)
            .css('width', modal.width() + 1);
    } else {
        modal_container = $('<div></div>')
            .css('height', '0')
            .css('width', '0')
            .css('top', window_scroll.top + $(window).height() / 2)
            .css('left', window_scroll.left + $(window).width() / 2)
            .appendTo('html');
        modal = $('<div></div>')
            .text('this is some other crap')
            .css('height', '0')
            .css('width', '0')
            .appendTo(modal_container);
    }
    setTimeout(function() {
        modal_container
            .addClass(EXTENSION_ID + '-modal-container')
            .css('height', '100%')
            .css('width', '100%')
            .css('top', window_scroll.top)
            .css('left', window_scroll.left);
        var clone = modal.clone().addClass(EXTENSION_ID + '-modal').appendTo('html');
        modal
            .addClass(EXTENSION_ID + '-modal')
            .css('height', clone.height() + 1)
            .css('width', clone.width() + 1)
            .on(TransitionEnd, function clear_height(e) {
                if (e.originalEvent.propertyName !== 'height') {
                    return;
                }
                modal
                    .off(TransitionEnd, clear_height)
                    .css('height', '');
            })
            .on(TransitionEnd, function clear_width(e) {
                if (e.originalEvent.propertyName !== 'width') {
                    return;
                }
                modal
                    .off(TransitionEnd, clear_width)
                    .css('width', '');
            });
        clone.remove();
    });

    $(document).on(Keydown, modal_backdrop_leave);
    $(window).one(Scroll, modal_backdrop_leave);
    modal_backdrop.one(Click, modal_backdrop_leave);
    function modal_backdrop_leave(e) {
        if (e.type === 'keydown') {
            if (e.which !== 27) {
                return;
            }
        }
        $(document).off(Keydown, modal_backdrop_leave);
        $(window).off(Scroll, modal_backdrop_leave);
        modal_backdrop.off(Click, modal_backdrop_leave);

        modal.toggleAnimationClass(EXTENSION_ID + '-modal-leave', function() {
            modal_container.remove();
        });
        modal_backdrop.toggleAnimationClass(EXTENSION_ID + '-modal-backdrop-leave', function() {
            modal_backdrop.remove();
        });
    }
};

window.addEventListener('message', function(event) {
    if (!event || !event.data) {
        return;
    }
    var message = event.data;
    if (message.msg !== EXTENSION_ID + '-modal') {
        return;
    }
    $.modal(message.identity, message.obj);
});
