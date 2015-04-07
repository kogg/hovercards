'use strict';

require(['hotkey-trigger'], function(hotkey_trigger) {
    hotkey_trigger.on('body');
});

require(['trigger-inject'], function(trigger_inject) {
    trigger_inject.on('body');
});
