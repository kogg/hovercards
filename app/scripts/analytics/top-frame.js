var $   = require('jquery');
var _   = require('underscore');
var env = require('env');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

window.addEventListener('message', function(event) {
	var message = event && event.data;
	if (!message || (message && message.msg) !== EXTENSION_ID + '-analytics') {
		return;
	}
	$.analytics.apply(this, message.request);
});

if (!env.analytics_id) {
	$.analytics = function() {
		console.debug('google analytics', _.toArray(arguments));
	};
	return;
}

function get_user_id(callback) {
	chrome.storage.sync.get('user_id', function(obj) {
		if (chrome.runtime.lastError || !obj || !obj.user_id) {
			return chrome.storage.local.get('user_id', function(obj) {
				var user_id = (!chrome.runtime.lastError && obj && obj.user_id) || _.times(25, _.partial(_.sample, ALPHANUMERIC, null)).join('');
				chrome.storage.sync.set({ user_id: user_id });
				callback(null, user_id);
			});
		}
		callback(null, obj.user_id);
	});
}

var analytics_queue = [];
$.analytics = function() {
	analytics_queue.push(arguments);
};
get_user_id(function(err, user_id) {
	if (err) {
		// TODO Programmed to never happen but you know
		return;
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
		window.ga.apply(this, _.toArray(arguments));
		$.analytics = function() {
			window.ga.apply(this, _.toArray(arguments));
		};
	};

	analytics_queue.forEach(function(args) {
		$.analytics.apply($.analytics, args);
	});
});
