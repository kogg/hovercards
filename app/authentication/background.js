var _         = require('underscore');
var analytics = require('../analytics/background');
var async     = require('async');
var config    = require('../config');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	if (_.result(message, 'type') !== 'auth') {
		return null;
	}
	callback = _.wrap(callback, function(callback, err, response) {
		if (err) {
			err.message = 'Authentication - ' + (_.isEmpty(message.api) ? '' : message.api + ' - ') + (err.message || 'No Explanation');
			analytics('send', 'exception', { exDescription: err.message, exFatal: false });
		} else {
			analytics('send', 'event', 'service', 'authenticated', message.api);
		}
		(callback || _.noop)([err, response]);
	});
	if (!message.api) {
		async.setImmediate(function() {
			callback({ message: 'Missing \'api\'', status: 400 });
		});
		return true;
	}
	var api_config = _.chain(config).result('apis').result(message.api).value();
	if (!_.result(api_config, 'can_auth')) {
		async.setImmediate(function() {
			callback({ message: message.api + ' cannot be authenticated', status: 404 });
		});
		return true;
	}
	chrome.identity.launchWebAuthFlow({
		url:         _.result(api_config, 'client_auth_url', config.endpoint + '/' + message.api + '/authenticate?chromium_id=EXTENSION_ID').replace('EXTENSION_ID', EXTENSION_ID),
		interactive: true
	},
		function(redirect_url) {
			if (chrome.runtime.lastError) {
				var err_message = chrome.runtime.lastError.message;
				return async.setImmediate(function() {
					callback({ message: err_message, status: 401 });
				});
			}
			var user = redirect_url && (redirect_url.split('#', 2)[1] || '').split('=', 2)[1];
			if (_.isEmpty(user)) {
				return async.setImmediate(function() {
					callback({ message: 'No user token returned for ' + message.api + ': ' + redirect_url, status: 500 });
				});
			}
			var obj = {};
			obj[message.api + '_user'] = user;
			chrome.storage.sync.set(obj, function() {
				if (chrome.runtime.lastError) {
					return callback({ message: chrome.runtime.lastError.message, status: 500 });
				}
				callback();
			});
		});

	return true;
});
