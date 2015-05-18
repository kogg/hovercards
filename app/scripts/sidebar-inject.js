var $      = require('jquery');
var common = require('./common');

var extension_id = chrome.i18n.getMessage('@@extension_id');

module.exports = function sidebarInjectOn(inject_into, body, dbl_clickable, sendMessage) {
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

    var initial_body_overflow;
    var initial_html_overflow;
    var iframe = $('<iframe webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>')
        .appendTo(obj)
        .attr('src', chrome.extension.getURL('sidebar.html'))
        .attr('frameborder', '0')
        .mouseenter(function() {
            initial_body_overflow = body.css('overflow-y');
            body.css('overflow-y', 'hidden');
            initial_html_overflow = $('html').css('overflow-y');
            $('html').css('overflow-y', 'hidden');
            if (common.get_scrollbar_width()) {
                iframe
                    .css('overflow', 'auto')
                    .attr('scrolling', 'auto');
                obj.width(340 + common.get_scrollbar_width());
                $('html').css('padding-right', '+=' + common.get_scrollbar_width());
            }
        })
        .mouseleave(function() {
            body.css('overflow-y', initial_body_overflow);
            $('html').css('overflow-y', initial_html_overflow);
            if (common.get_scrollbar_width()) {
                iframe
                    .css('overflow', 'hidden')
                    .attr('scrolling', 'no');
                obj.width(340);
                $('html').css('padding-right', '-=' + common.get_scrollbar_width());
            }
        });
    if (common.get_scrollbar_width()) {
        iframe
            .css('overflow', 'hidden')
            .attr('scrolling', 'no');
    }

    $('<div></div>')
        .appendTo(obj)
        .addClass(extension_id + '-sidebar-close-button')
        .click(function(e) {
            if (e.which !== 1) {
                return;
            }
            sendMessage({ msg: 'hide' });
        });

    $(dbl_clickable)
        .dblclick(function() {
            sendMessage({ msg: 'hide' });
        });

    return obj;
};
