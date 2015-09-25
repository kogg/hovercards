var $ = require('jquery');
require('./common');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Click   = 'click' + NameSpace;
var Keydown = 'keydown' + NameSpace;
var Scroll  = 'scroll' + NameSpace;

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
    if (hovercard) {
        modal_container = hovercard.parent();
        modal_container
            .css('height', modal_container.height() + 1)
            .css('width', modal_container.width() + 1);
        modal = hovercard;
    } else {
        modal_container = $('<div></div>').appendTo('html');
        modal = $('<div></div>').appendTo(modal_container);
    }
    modal_container.addClass(EXTENSION_ID + '-modal-container')
    modal.addClass(EXTENSION_ID + '-modal')
    setTimeout(function() {
        modal_container
            .css('height', '100%')
            .css('width', '100%')
            .offset({ top:  $(window).scrollTop(),
                      left: $(window).scrollLeft() })
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
