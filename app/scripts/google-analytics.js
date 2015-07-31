var _     = require('underscore');
var async = require('async');
var env   = require('env');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

if (!env.analytics_id) {
    module.exports = function() {
        window.addEventListener('message', function(event) {
            if (!_.chain(event).result('data').isObject().value()) {
                return;
            }
            var message = event.data;
            if (message.msg !== EXTENSION_ID + '-analytics') {
                return;
            }
            console.debug('google analytics', message.request);
        });
    };
    return;
}

module.exports = function() {
    async.waterfall([
        function(callback) {
            chrome.storage.local.get('user_id', function(obj) {
                if (chrome.runtime.lastError) {
                    return callback(chrome.runtime.lastError);
                }
                if (!obj.user_id) {
                    obj = { user_id: _.times(25, _.partial(_.sample, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 1, 1)).join('') };
                    chrome.storage.local.set(obj);
                }
                callback(null, obj.user_id);
            });
        },
        function(user_id, callback) {
            var setup_analytics = _.once(function() {
                window.GoogleAnalyticsObject = 'ga';
                window.ga = window.ga || function() {
                    (window.ga.q = window.ga.q || []).push(arguments);
                };
                window.ga.l = 1 * new Date();
                require('./analytics-local');

                window.ga('create', env.analytics_id, { 'userId': user_id });
                window.ga('set', { appName: chrome.i18n.getMessage('app_name'), appVersion: chrome.runtime.getManifest().version });
            });

            window.addEventListener('message', function(event) {
                if (!_.chain(event).result('data').isObject().value()) {
                    return;
                }
                var message = event.data;
                if (message.msg !== EXTENSION_ID + '-analytics') {
                    return;
                }
                setup_analytics();
                window.ga.apply(this, message.request);
            });
            callback();
        }
    ]);
};
