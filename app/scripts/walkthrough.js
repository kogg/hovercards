var $ = require('jquery');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

function class_name(className) {
    return EXTENSION_ID + '-' + className;
}

function makePopover(body) {
    $('.' + class_name('black-overlay')).remove();
    $('<div class="' + class_name('black-overlay') + '"></div>')
        .appendTo(body)
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
            '</div>').appendTo(body);
}

var stages = [
    /*
     * Stage 0
     */
    (function() {
        var obj;

        function onFollowHover(event) {
            if (!event || !event.data) {
                return;
            }
            var request = event.data;
            if (request.msg !== 'yo-follower-hover') {
                return;
            }
            window.removeEventListener('message', onFollowHover);
            obj = makePopover('body')
                .offset({ top:  request.object.bottom + 10,
                          left: request.mouse.x - 70 });
            obj.find('.' + class_name('walkthrough-step'))
                .addClass(class_name('walkthrough-step1'))
                .append('<div class="' + class_name('cursor') + '"></div>')
                .append('<div class="' + class_name('cursor-expand') + '"></div>')
                .append('<div class="' + class_name('cursor-pulse') + '"></div>');
            obj.find('.' + class_name('step-1')).html(chrome.i18n.getMessage('longpress_to_activate'));
            obj.find('.' + class_name('step-1-5')).text(chrome.i18n.getMessage('tip_x_of_y', [1, 4]));
            obj.find('.' + class_name('next-step')).one('click', function() {
                obj.find('.' + class_name('walkthrough-step')).addClass(class_name('walkthrough-step1-step2'));
                obj.find('.' + class_name('step-1')).html(chrome.i18n.getMessage('yo_follower_means_integrated'));
                obj.find('.' + class_name('step-1-5')).text(chrome.i18n.getMessage('tip_x_of_y', [2, 4]));
                obj.find('.' + class_name('next-step')).one('click', function() {
                    obj.find('.' + class_name('step-1')).html(chrome.i18n.getMessage('please_longpress'));
                    obj.find('.' + class_name('next-step')).hide();
                });
            });
        }

        function onLoaded() {
            if (!event || !event.data) {
                return;
            }
            var request = event.data;
            if (request.msg !== 'loaded') {
                return;
            }
            chrome.storage.sync.set({ walkthrough_stage: 1 });
        }

        return {
            setup: function() {
                window.addEventListener('message', onFollowHover);
                window.addEventListener('message', onLoaded);
            },
            cleanup: function() {
                window.removeEventListener('message', onFollowHover);
                window.removeEventListener('message', onLoaded);
                if (obj) {
                    obj.remove();
                }
            }
        };
    }()),
    /*
     * Stage 1
     */
    (function() {
        var obj;

        function onHidden() {
            if (!event || !event.data) {
                return;
            }
            var request = event.data;
            if (request.msg !== 'hidden') {
                return;
            }
            chrome.storage.sync.set({ walkthrough_stage: 2 });
        }

        return {
            setup: function() {
                window.addEventListener('message', onHidden);
                obj = makePopover('body')
                    .css('position', 'fixed')
                    .css('top', '18')
                    .css('right', '382');
                obj.find('.' + class_name('walkthrough-step'))
                    .addClass(class_name('walkthrough-step3'))
                    .append('<div class="' + class_name('defaultcursor') + '"></div>')
                    .append('<div class="' + class_name('cursor-pulse') + '"></div>')
                    .append('<div class="' + class_name('cursor-pulse') + '"></div>');
                obj.find('.' + class_name('step-1')).html(chrome.i18n.getMessage('dblclick_or_esc_to_close'));
                obj.find('.' + class_name('step-1-5')).text(chrome.i18n.getMessage('tip_x_of_y', [3, 4]));
                obj.find('.' + class_name('next-step')).one('click', function() {
                    obj.remove();
                });
            },
            cleanup: function() {
                window.removeEventListener('message', onHidden);
                if (obj) {
                    obj.remove();
                }
            }
        };
    }()),
    /*
     * Stage 2
     */
    (function() {
        var obj;

        return {
            setup: function() {
                obj = makePopover('body')
                    .css('position', 'fixed')
                    .css('top', '18')
                    .css('right', '10');
                obj.find('.' + class_name('walkthrough-step'))
                    .addClass(class_name('walkthrough-step4'))
                    .append('<div class="' + class_name('defaultcursor') + '"></div>')
                    .append('<div class="' + class_name('cursor-pulse') + '"></div>');
                obj.find('.' + class_name('step-1')).html(chrome.i18n.getMessage('carlito_will_search_here'));
                obj.find('.' + class_name('step-1-5')).text(chrome.i18n.getMessage('tip_x_of_y', [4, 4]));
                obj.find('.' + class_name('next-step')).one('click', function() {
                    chrome.storage.sync.set({ walkthrough_stage: 3 });
                });
            },
            cleanup: function() {
                if (obj) {
                    obj.remove();
                }
            }
        };
    }())
];

var lastStage = -1;
function setStage(newStage) {
    if (lastStage === newStage) {
        return;
    }
    console.log('changing walkthrough stage from', lastStage, 'to', newStage);
    if (stages[lastStage]) {
        stages[lastStage].cleanup();
    }
    if (stages[newStage]) {
        stages[newStage].setup();
    }
    lastStage = newStage;
}

/* Uncomment this to start over walkthrough */
// chrome.storage.sync.remove('walkthrough_stage');
chrome.storage.sync.get('walkthrough_stage', function(obj) {
    if (chrome.runtime.lastError) {
        return;
    }
    if (obj.walkthrough_stage >= stages.length) {
        return;
    }
    $('head')
        .append('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('styles/walkthrough.css') + '">');
    setStage(obj.walkthrough_stage || 0);

    chrome.storage.onChanged.addListener(function(changes, area_name) {
        if (area_name !== 'sync' || !('walkthrough_stage' in changes)) {
            return;
        }
        setStage(changes.walkthrough_stage.newValue || 0);
    });
});
