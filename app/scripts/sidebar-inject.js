var $ = require('jquery');

var extension_id = chrome.i18n.getMessage('@@extension_id');

module.exports = function sidebarInjectOn(inject_into, body, clickable, sendMessage) {
    body = $(body);

    var obj = $('<div></div>')
        .appendTo($(inject_into))
        .addClass(extension_id + '-sidebar')
        .width(340)
        .hide()
        .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
            if (e.originalEvent.animationName !== 'slide-out-' + extension_id) {
                return;
            }
            obj.hide();
        })
        .on('sidebar.msg', function(e, request) {
            switch (request.msg) {
                case 'load':
                    obj
                        .show()
                        .removeClass(extension_id + '-sidebar-leave')
                        .addClass(extension_id + '-sidebar-enter');
                    sendMessage({ msg: 'loaded' });
                    break;
                case 'hide':
                    obj
                        .removeClass(extension_id + '-sidebar-enter')
                        .addClass(extension_id + '-sidebar-leave');
                    sendMessage({ msg: 'hidden' });
                    break;
            }
        });

    window.addEventListener('message', function(event) {
        if (!event || !event.data || event.data.msg !== extension_id + '-fullscreen') {
            return;
        }
        obj.toggleClass(extension_id + '-fullscreen', event.data.value || false);
    }, false);

    var prevent_everything = function(e) {
        e.preventDefault();
        e.stopPropagation();
    };

    $('<div></div>')
        .appendTo(obj)
        .addClass(extension_id + '-sidebar-close-button')
        .click(function() {
            sendMessage({ msg: 'hide' });
        });

    $('<iframe webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>')
        .appendTo(obj)
        .attr('src', chrome.extension.getURL('sidebar.html'))
        .attr('frameborder', '0')
        .mouseenter(function() {
            $(window).on('mousewheel', prevent_everything);
        })
        .mouseleave(function() {
            $(window).off('mousewheel', prevent_everything);
        });

    $(clickable)
        .click(function(e) {
            if (e.which !== 1) {
                return;
            }
            var obj = $(e.target);
            var cursor = obj.css('cursor');
            if (cursor !== 'default' && (cursor !== 'auto' || obj.closest('a,input,textarea,video,embed,object,button,audio,label').length)) {
                return;
            }
            sendMessage({ msg: 'hide' });
        });

    return obj;
};
