'use strict';

define('sidebar-inject', ['jquery'], function($) {
    return {
        on: function sidebarInjectOn(body, html) {
            body = $(html)
                .dblclick(function() {
                    chrome.runtime.sendMessage({ msg: 'hide' });
                });

            var obj = $('<div class="hovercards-sidebar"></div>')
                .appendTo(body)
                .hide()
                .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                    if (e.originalEvent.animationName !== 'slide-out-hovercards') {
                        return;
                    }
                    obj.hide();
                });

            $('<iframe></iframe>')
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
                    chrome.runtime.sendMessage({ msg: 'hide' });
                });


            chrome.runtime.onMessage.addListener(function(request) {
                switch (request.msg) {
                    case 'load':
                        obj
                            .show()
                            .removeClass('hovercards-sidebar-leave')
                            .addClass('hovercards-sidebar-enter');
                        chrome.runtime.sendMessage({ msg: 'loaded' });
                        break;
                    case 'hide':
                        obj
                            .removeClass('hovercards-sidebar-enter')
                            .addClass('hovercards-sidebar-leave');
                        chrome.runtime.sendMessage({ msg: 'hidden' });
                        break;
                }
            });

            return obj;
        }
    };
});
