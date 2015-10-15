// jshint ignore: start
require('./service-background')();
require('./page-action-background')();

var _     = require('underscore');
var env   = require('env');
var async = require('async');

if (!env.analytics_id) {
    chrome.runtime.onMessage.addListener(function(message) {
        if (message.type !== 'analytics') {
            return;
        }
        console.debug('google analytics', message.request);
    });
} else {
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
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

                window.ga('create', env.analytics_id, { 'userId': user_id });
                window.ga('set', 'checkProtocolTask', function(){});
                window.ga('set', { appName: chrome.i18n.getMessage('app_name'), appVersion: chrome.runtime.getManifest().version });
                window.ga('send', 'screenview', { screenName: 'None' });
            });

            chrome.runtime.onMessage.addListener(function(message) {
                if (message.type !== 'analytics') {
                    return;
                }
                console.log('google analytics', message.request);
                setup_analytics();
                window.ga.apply(window.ga, message.request);
            });
            callback();
        }
    ]);

}
