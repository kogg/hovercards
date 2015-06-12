var $ = require('jquery');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

function class_name(className) {
    return EXTENSION_ID + '-' + className;
}

function makePopover() {
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
            '</div>');
}

var stages = [
    /*
     * Stage 0
     */
    (function() {
        function onFollowHover(event) {
            if (!event || !event.data) {
                return;
            }
            var request = event.data;
            if (request.msg !== 'yo-follower-hover') {
                return;
            }
            window.removeEventListener('message', onFollowHover);
            var obj = makePopover()
                .appendTo('body')
                .offset({ top:  request.object.bottom + 10,
                          left: request.mouse.x - 380/2 });
            obj.find('.' + class_name('walkthrough-step'))
                .addClass(class_name('walkthrough-step1'))
                .append('<div class="' + class_name('cursor') + '"></div>')
                .append('<div class="' + class_name('cursor-expand') + '"></div>')
                .append('<div class="' + class_name('cursor-pulse') + '"></div>');
            obj.find('.' + class_name('step-1')).html(chrome.i18n.getMessage('click_and_hold_to_activate'));
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

        return {
            setup: function() {
                window.addEventListener('message', onFollowHover);
            },
            cleanup: function() {
                window.removeEventListener('message', onFollowHover);
                $('body').find('.' + class_name('walkthrough')).remove();
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

// chrome.storage.sync.clear();
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
