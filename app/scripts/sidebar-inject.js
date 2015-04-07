'use strict';

define('sidebar-inject', ['jquery'], function($) {
    return {
        on: function sidebarInjectOn(body, html) {
            html = $(html)
                .dblclick(function() {
                    chrome.runtime.sendMessage({ msg: 'hide' });
                });
            body = $(body);

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

            var loaded_once = false;
            var hidden_once = false;
            chrome.runtime.onMessage.addListener(function(request) {
                switch (request.msg) {
                    case 'load':
                        obj
                            .show()
                            .removeClass('hovercards-sidebar-leave')
                            .addClass('hovercards-sidebar-enter');
                        if (loaded_once) {
                            break;
                        }
                        loaded_once = true;
                        chrome.storage.sync.get('intro', function(storage) {
                            if (storage.intro) {
                                return;
                            }
                            chrome.runtime.sendMessage({ msg: 'notify', type: 'firstload' });
                        });
                        break;
                    case 'hide':
                        obj
                            .removeClass('hovercards-sidebar-enter')
                            .addClass('hovercards-sidebar-leave');
                        if (hidden_once) {
                            break;
                        }
                        hidden_once = true;
                        chrome.storage.sync.get('intro', function(storage) {
                            if (storage.intro) {
                                return;
                            }
                            chrome.runtime.sendMessage({ msg: 'notify', type: 'firsthide' });
                        });
                        break;
                }
            });

            return obj;
        }
    };
});
