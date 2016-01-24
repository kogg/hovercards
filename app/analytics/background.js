var _      = require('underscore');
var async  = require('async');
var config = require('../config');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

var responder = function(args, callback) {
	async.setImmediate(callback || _.noop);
}; // This name is stupid

module.exports = function() {
	responder(_.toArray(arguments));
};

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	if (_.result(message, 'type') !== 'analytics') {
		return null;
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
		// I want some kind of async.**** that is similar to async.retry, but
		// doesn't keep retrying the same method, but tries them in a row.
		// Essentially, an async.waterfall that quits not when it gets an err,
		// but when it gets a success. async.some is close, but I want it in
		// series and to callback the result, not a truth value
		//
		// I'm going to accomplish this using async.series and just use the
		// err to callback my result immediately. I know, disgusting.
		async.waterfall([
			function(callback) {
				// This is where we want it to be
				chrome.storage.sync.get('user_id', function(obj) {
					callback(_.result(obj, 'user_id'));
				});
			},
			function(callback) {
				// This is where it used to be
				chrome.storage.local.get('user_id', function(obj) {
					if (!_.isEmpty(obj)) {
						chrome.storage.sync.set(_.pick(obj, 'user_id'));
					}
					callback(_.result(obj, 'user_id'));
				});
			},
			function(callback) {
				var user_id = _.times(25, _.partial(_.sample, ALPHANUMERIC, null)).join('');
				chrome.storage.sync.set({ user_id: user_id });
				callback(user_id);
			}
		], function(user_id) {
			/* eslint-disable */
			(function(i, s, o, g, r, a, m) {i['GoogleAnalyticsObject'] = r;i[r] = i[r] || function() {
				(i[r].q = i[r].q || []).push(arguments);}, i[r].l = 1 * new Date();a = s.createElement(o),
			m = s.getElementsByTagName(o)[0];a.async = 1;a.src = g;m.parentNode.insertBefore(a, m);
			})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
			/* eslint-enable */

			window.ga('create', config.analytics_id, { userId: user_id });
			window.ga('set', 'checkProtocolTask', _.noop);
			window.ga('set', { appName: chrome.i18n.getMessage('app_name'), appVersion: chrome.runtime.getManifest().version });

			responder = function(args, callback) {
				window.ga.apply(this, args);
				if (_.chain(args).last().result('hitCallback').isFunction().value()) {
					return;
				}
				async.setImmediate(callback || _.noop);
			};
		});
		break;
	default:
		responder = function(args, callback) {
			if (_.chain(args).first(2).isEqual(['send', 'exception']).value()) {
				console.error('google analytics', args);
			} else {
				console.debug('google analytics', args);
			}
			if (_.chain(args).last().result('hitCallback').isFunction().value()) {
				return async.setImmediate(_.last(args).hitCallback);
			}
			async.setImmediate(callback || _.noop);
		};
		break;
}
