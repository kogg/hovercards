var _   = require('underscore');
var env = require('env');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = function() {
    window.addEventListener('message', function(event) {
        if (!_.chain(event).result('data').isObject().value()) {
            return;
        }
        var message = event.data;
        if (message.msg !== EXTENSION_ID + '-analytics') {
            return;
        }
        message.type = 'analytics';
        if (!env.analytics_id) {
            console.debug('google analytics', message.request);
        }
        chrome.runtime.sendMessage(message);
    });
};
