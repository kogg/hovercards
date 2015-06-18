var $ = require('jquery');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = function walkthrough() {
    function class_name(className) {
        return EXTENSION_ID + '-' + className;
    }

    function makePopover() {
        $('.' + class_name('black-overlay')).remove();
        $('<div class="' + class_name('black-overlay') + '"></div>')
            .appendTo('.' + class_name('container'))
            .on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                if (e.originalEvent.animationName !== EXTENSION_ID + '-overlay-fadeout') {
                    return;
                }
                $(this).remove();
            });
        return $('<div class="' + class_name('walkthrough') + '">' +
                    '<div class="' + class_name('walkthrough-step') + '"></div>' +
                    '<div class="' + class_name('walkthrough-instructions') + '">' +
                        '<ul>' +
                            '<li class="' + class_name('step-1') + '"></li>' +
                        '</ul>' +
                        '<div class="' + class_name('step-container') + '">' +
                            '<b class="' + class_name('step-1-5') + '"></b>' +
                            '<b class="' + class_name('next-step') + '">' + chrome.i18n.getMessage('got_it') + '</b>'+
                        '</div>'+
                    '</div>' +
                '</div>').appendTo('.' + class_name('container'));
    }

    var carlito_obj;
    var carlito_timeout;
    var closing_obj;
    var closing_timeout;
    var hover_timeout;
    var indicator_obj;
    var longpress_obj;

    function onLoaded() {
        if (!event || !event.data) {
            return;
        }
        var request = event.data;
        if (request.msg !== 'loaded') {
            return;
        }
        closing_timeout = setTimeout(function() {
            closing_obj = makePopover()
                .css('position', 'fixed')
                .css('top', '18px')
                .css('right', '382px');
            closing_obj.find('.' + class_name('walkthrough-step'))
                .addClass(class_name('walkthrough-step3'))
                .append('<div class="' + class_name('defaultcursor') + '"></div>')
                .append('<div class="' + class_name('cursor-pulse') + '"></div>')
                .append('<div class="' + class_name('cursor-pulse') + '"></div>');
            closing_obj.find('.' + class_name('step-1')).html(chrome.i18n.getMessage('dblclick_or_esc_to_close'));
            closing_obj.find('.' + class_name('step-1-5')).text(chrome.i18n.getMessage('tip_x_of_y', [3, 4]));
            closing_obj.find('.' + class_name('next-step')).one('click', function() {
                closing_obj.remove();
            });
        }, 10000);
        chrome.storage.sync.set({ walkthrough_stage_0: 2 });
    }

    var stages = [
        // Stage 0:
        // after hover_timeout, on hover make longpress_obj and go to Stage 1
        (function() {
            function onFollowHover(event) {
                if (!event || !event.data) {
                    return;
                }
                var request = event.data;
                if (request.msg !== 'yo-follower-hover') {
                    return;
                }
                longpress_obj = makePopover()
                    .offset({ top:  request.object.bottom + 10,
                              left: request.mouse.x - 70 });
                longpress_obj.find('.' + class_name('walkthrough-step'))
                    .addClass(class_name('walkthrough-step1'))
                    .append('<div class="' + class_name('cursor') + '"></div>')
                    .append('<div class="' + class_name('cursor-expand') + '"></div>')
                    .append('<div class="' + class_name('cursor-pulse') + '"></div>');
                longpress_obj.find('.' + class_name('step-1')).html(chrome.i18n.getMessage('longpress_to_activate'));
                longpress_obj.find('.' + class_name('step-1-5')).text(chrome.i18n.getMessage('tip_x_of_y', [1, 4]));
                longpress_obj.find('.' + class_name('next-step')).one('click', function() {
                    longpress_obj.find('.' + class_name('walkthrough-step')).addClass(class_name('walkthrough-step1-step2'));
                    longpress_obj.find('.' + class_name('step-1')).html(chrome.i18n.getMessage('yo_follower_means_integrated'));
                    longpress_obj.find('.' + class_name('step-1-5')).text(chrome.i18n.getMessage('tip_x_of_y', [2, 4]));
                    longpress_obj.find('.' + class_name('next-step')).one('click', function() {
                        longpress_obj.find('.' + class_name('step-1')).html(chrome.i18n.getMessage('please_longpress'));
                        longpress_obj.find('.' + class_name('next-step')).hide();
                        indicator_obj = $('<div class="' + class_name('link-indicator') + '"></div>')
                            .appendTo('.' + class_name('container'))
                            .offset({ top:  request.object.bottom - 20,
                                      left: request.mouse.x });
                    });
                });
                chrome.storage.sync.set({ walkthrough_stage_0: 1 });
            }

            return {
                setup: function() {
                    hover_timeout = setTimeout(function() {
                        window.addEventListener('message', onFollowHover);
                    }, 2500);
                    window.addEventListener('message', onLoaded);
                },
                cleanup: function() {
                    clearTimeout(hover_timeout);
                    window.removeEventListener('message', onFollowHover);
                    window.removeEventListener('message', onLoaded);
                }
            };
        }()),
        // Stage 1:
        // on loaded, after closing_timeout, make closing_obj and go to Stage 2
        {
            setup: function() {
                window.addEventListener('message', onLoaded);
            },
            cleanup: function() {
                window.removeEventListener('message', onLoaded);
            }
        },
        // Stage 2:
        // if longpress_obj kill it
        // on closing, after carlito_timeout, make carlito_obj and go to Stage 3
        (function() {
            function onHidden() {
                if (!event || !event.data) {
                    return;
                }
                var request = event.data;
                if (request.msg !== 'hidden') {
                    return;
                }
                carlito_timeout = setTimeout(function() {
                    carlito_obj = makePopover()
                        .css('position', 'fixed')
                        .css('top', '18px')
                        .css('right', '10px');
                    carlito_obj.find('.' + class_name('walkthrough-step'))
                        .addClass(class_name('walkthrough-step4'))
                        .append('<div class="' + class_name('defaultcursor') + '"></div>')
                        .append('<div class="' + class_name('cursor-pulse') + '"></div>');
                    carlito_obj.find('.' + class_name('step-1')).html(chrome.i18n.getMessage('carlito_will_search_here'));
                    carlito_obj.find('.' + class_name('step-1-5')).text(chrome.i18n.getMessage('tip_x_of_y', [4, 4]));
                    carlito_obj.find('.' + class_name('next-step')).one('click', function() {
                        carlito_obj.remove();
                    });
                }, 650);
                chrome.storage.sync.set({ walkthrough_stage_0: 3 });
            }

            return {
                setup: function() {
                    if (longpress_obj) {
                        longpress_obj.remove();
                    }
                    if (indicator_obj) {
                        indicator_obj.remove();
                    }
                    window.addEventListener('message', onHidden);
                },
                cleanup: function() {
                    window.removeEventListener('message', onHidden);
                }
            };
        }()),
        // Stage 3:
        // if closing_timeout kill it
        // if closing_obj kill it
        {
            setup: function() {
                clearTimeout(closing_timeout);
                if (closing_obj) {
                    closing_obj.remove();
                }
            }
        },
        // Stage 4:
        // if carlito_timeout kill it
        // if carlito_obj kill it
        {
            setup: function() {
                clearTimeout(carlito_timeout);
                if (carlito_obj) {
                    carlito_obj.remove();
                }
            }
        }
    ];

    var lastStage = -1;
    function setStage(newStage) {
        if (lastStage === newStage) {
            return;
        }
        console.log('changing walkthrough stage from', lastStage, 'to', newStage);
        if (stages[lastStage]) {
            (stages[lastStage].cleanup || $.noop)();
        }
        if (stages[newStage]) {
            (stages[newStage].setup || $.noop)();
        }
        lastStage = newStage;
    }

    /* Uncomment this to start over walkthrough */
    // chrome.storage.sync.remove('walkthrough_stage_0');
    chrome.storage.sync.get('walkthrough_stage_0', function(obj) {
        if (chrome.runtime.lastError) {
            return;
        }
        if (obj.walkthrough_stage_0 >= stages.length) {
            return;
        }
        $('head').append('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('styles/walkthrough.css') + '">');
        setStage(obj.walkthrough_stage_0 || 0);

        chrome.storage.onChanged.addListener(function(changes, area_name) {
            if (area_name !== 'sync' || !('walkthrough_stage_0' in changes)) {
                return;
            }
            setStage(changes.walkthrough_stage_0.newValue || 0);
        });
    });
};
