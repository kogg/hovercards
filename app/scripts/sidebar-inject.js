var $ = require('jquery');

module.exports = function sidebarInjectOn(inject_into, body, dbl_clickable, sendMessage) {
    body = $(body);

    var obj = $('<div class="hovercards-sidebar"></div>')
        .appendTo($(inject_into))
        .hide()
        .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
            if (e.originalEvent.animationName !== 'slide-out-hovercards') {
                return;
            }
            obj.hide();
        })
        .on('sidebar.msg', function(e, request) {
            switch (request.msg) {
                case 'load':
                    obj
                        .show()
                        .removeClass('hovercards-sidebar-leave')
                        .addClass('hovercards-sidebar-enter');
                    sendMessage({ msg: 'loaded' });
                    break;
                case 'hide':
                    obj
                        .removeClass('hovercards-sidebar-enter')
                        .addClass('hovercards-sidebar-leave');
                    sendMessage({ msg: 'hidden' });
                    break;
            }
        });

    var iframe = $('<iframe webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>')
        .appendTo(obj)
        .prop('src', chrome.extension.getURL('sidebar.html'))
        .prop('frameborder', '0')
        .mouseenter(function() {
            body.css('overflow', 'hidden');
        })
        .mouseleave(function() {
            body.css('overflow', 'auto');
        });

    $('<div class="hovercards-sidebar-close-button"></div>')
        .appendTo(obj)
        .click(function(e) {
            if (e.which !== 1) {
                return;
            }
            sendMessage({ msg: 'hide' });
        });

    $(dbl_clickable)
        .dblclick(function() {
            sendMessage({ msg: 'hide' });
        })
        .on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function() {
            var is_iframe = (iframe.get(0) === (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement));
            obj.toggleClass('yocards-fullscreen-sidebar', is_iframe);
            if (is_iframe) {
                obj.attr('style', 'height: ' + screen.height + 'px !important');
            }
        });

    return obj;
};
