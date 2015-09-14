var $   = require('jquery');
var _   = require('underscore');
var env = require('env');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

if (env.analytics_id) {
    module.exports = function($body) {
        $body = $($body || 'body');

        chrome.storage.sync.get('user_id', function(obj) {
            if (chrome.runtime.lastError || !obj || !obj.user_id) {
                return chrome.storage.local.get('user_id', function(obj) {
                    setup((!chrome.runtime.lastError && obj && obj.user_id) ? obj.user_id : null, true);
                });
            }
            setup(obj.user_id);
        });

        function setup(user_id, needs_set) {
            if (!user_id || !user_id.length) {
                user_id = _.times(25, _.partial(_.sample, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 1, 1)).join('');
                needs_set = true;
            }
            if (needs_set) {
                chrome.storage.local.set({ user_id: user_id });
            }

            $body.one('analytics.' + EXTENSION_ID, function() {
                window.GoogleAnalyticsObject = 'ga';
                window.ga = window.ga || function() {
                    (window.ga.q = window.ga.q || []).push(arguments);
                };
                window.ga.l = 1 * new Date();
                require('../analytics-local');

                window.ga('create', env.analytics_id, { 'userId': user_id });
                window.ga('set', { appName: chrome.i18n.getMessage('app_name'), appVersion: chrome.runtime.getManifest().version });
                window.ga('send', 'screenview', { screenName: 'None' });
            });

            $body.on('analytics.' + EXTENSION_ID, function() {
                window.ga.apply(this, Array.prototype.slice.call(arguments, 1));
            });
        }
    };
} else {
    module.exports = function($body) {
        $body = $($body || 'body');

        $body.on('analytics.' + EXTENSION_ID, function() {
            console.debug('google analytics', Array.prototype.slice.call(arguments, 1));
        });
    };
}
