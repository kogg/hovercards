var $ = require('jquery');
require('./common');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Keydown = 'keydown' + NameSpace;
var Scroll  = 'scroll' + NameSpace;

var $top = $('html,body');

$.modal = function(identity, obj_to_transform) {
    var modal_container = $('<div class="' + EXTENSION_ID + '-modal-container"></div>').appendTo('html');

    $(document).on(Keydown, modal_container_leave);
    $(window).one(Scroll, modal_container_leave);
    function modal_container_leave(e) {
        if (e.type === 'keydown') {
            if (e.which !== 27) {
                return;
            }
        }
        $(document).off(Keydown, modal_container_leave);
        $(window).off(Scroll, modal_container_leave);
        modal_container
            .addClass(EXTENSION_ID + '-modal-container-leave')
            .on('animationend', function animationend(e) {
                if (e.originalEvent.animationName !== EXTENSION_ID + '-modal-container-leave-animation') {
                    return;
                }
                modal_container.remove();
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
