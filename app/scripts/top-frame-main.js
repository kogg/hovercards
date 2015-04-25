var $ = require('jquery');

var notifications_inject = require('./notifications-inject');
var sidebar_inject       = require('./sidebar-inject');
var state_manager        = require('./state-manager');

var hovercards_container = $('<div class="hovercards-container"></div>').appendTo('html');
notifications_inject(hovercards_container);
sidebar_inject(hovercards_container, 'body', 'html');

state_manager();

var sidebar_trigger = require('./sidebar-trigger')();
window.addEventListener('message', function(event) {
    sidebar_trigger(event.data, function(trigger) {
        console.log('trigger', trigger);
    });
}, false);
