var _      = require('underscore');
var config = require('../config');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

var responder = function(args, callback) { (callback || _.noop)(); }; // This name is stupid

module.exports = function() {
	responder(_.toArray(arguments));
};

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	if (_.result(message, 'type') !== 'analytics') {
		return;
	}
	var type = _.first(message.request);
	if (type === 'send') {
		var object = _.last(message.request);
		if (!_.isObject(object) || _.isString(object) || _.isFunction(object)) {
			object = {};
			message.request.push(object);
		}
		object.hitCallback = _.wrap(object.hitCallback, function(hitCallback) {
			(hitCallback || _.noop)();
			(callback || _.noop)();
		});
		var screenName = object.screenName || _.chain(sender).result('tab').result('url').value() || _.result(sender, 'url');
		if (screenName) {
			object.screenName = screenName;
		}
	}
	responder(message.request, callback);
	return true;
});

switch (process.env.NODE_ENV) {
	case 'production':
		(function(callback) {
			chrome.storage.sync.get('user_id', function(obj) {
				if (chrome.runtime.lastError || _.isEmpty(obj.user_id)) {
					return chrome.storage.local.get('user_id', function(obj) {
						var user_id = (!chrome.runtime.lastError && !_.isEmpty(obj.user_id)) || _.times(25, _.partial(_.sample, ALPHANUMERIC, null)).join('');
						chrome.storage.sync.set({ user_id: user_id });
						callback(user_id);
					});
				}
				callback(obj.user_id);
			});
		})(function(user_id) {
			/* jshint ignore:start */
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
			/* jshint ignore:end */

			window.ga('create', config.analytics_id, { 'userId': user_id });
			window.ga('set', 'checkProtocolTask', function(){});
			window.ga('set', { appName: chrome.i18n.getMessage('app_name'), appVersion: chrome.runtime.getManifest().version });

			responder = function(args, callback) {
				window.ga.apply(this, args);
				if (_.chain(args).last().result('hitCallback').isFunction().value()) {
					return;
				}
				(callback || _.noop)();
			};
		});
		break;
	default:
		responder = function(args, callback) {
			if (args[0] === 'send' && args[1] === 'exception') {
				console.error('google analytics', args);
			} else {
				console.debug('google analytics', args);
			}
			if (_.chain(args).last().result('hitCallback').isFunction().value()) {
				return _.last(args).hitCallback();
			}
			(callback || _.noop)();
		};
		break;
}
