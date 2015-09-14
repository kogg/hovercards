var $   = require('jquery');
var env = require('env');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

function get_user_id(callback) {
    chrome.storage.sync.get('user_id', function(obj) {
        if (chrome.runtime.lastError || !obj || !obj.user_id) {
            return chrome.storage.local.get('user_id', function(obj) {
                var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                var user_id = !chrome.runtime.lastError && obj && obj.user_id;
                if (user_id) {
                    user_id = '';
                    for (var i = 0; i < 25; i++) {
                        user_id += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
                    }
                }
                chrome.storage.sync.set({ user_id: user_id });
                callback(null, user_id);
            });
        }
        callback(null, obj.user_id);
    });
}

if (env.analytics_id) {
    module.exports = function($html) {
        get_user_id(function(err, user_id) {
            if (err) {
                return console.error('error getting user_id', err);
            }

            $.analytics = function() {
                window.GoogleAnalyticsObject = 'ga';
                window.ga = window.ga || function() {
                    (window.ga.q = window.ga.q || []).push(arguments);
                };
                window.ga.l = 1 * new Date();
                require('./analytics-local');

                window.ga('create', env.analytics_id, { 'userId': user_id });
                window.ga('set', { appName: chrome.i18n.getMessage('app_name'), appVersion: chrome.runtime.getManifest().version });
                window.ga('send', 'screenview', { screenName: 'None' });
                window.ga.apply(this, Array.prototype.slice.call(arguments));
                $.analytics = function() {
                    window.ga.apply(this, Array.prototype.slice.call(arguments));
                };
            };
        });
    };
} else {
    module.exports = function() {
        $.analytics = function() {
            console.debug('google analytics', Array.prototype.slice.call(arguments));
        };
    };
}

var old_exports = module.exports;
module.exports = function() {
    old_exports();
    window.addEventListener('message', function(event) {
        if (!event || !event.data) {
            return;
        }
        var message = event.data;
        if (message.msg !== EXTENSION_ID + '-analytics') {
            return;
        }
        $.analytics.apply(this, message.request);
    });
};
