var _             = require('underscore');
var config        = require('../config');
var shared_config = require('hovercardsshared/config');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	if ((message && message.type) !== 'auth') {
		return;
	}
	callback = _.wrap(callback, function(callback, err, response) {
		callback([err, response]);
	});
	if (!message.api) {
		callback({ message: 'Missing \'api\'', status: 400 });
		return true;
	}
	var api_config = _.defaults({},
	                            _.chain(config).result('apis').result(message.api).value(),
	                            _.chain(shared_config).result('apis').result(message.api).value());
	if (!_.result(api_config, 'can_auth')) {
		callback({ message: message.api + ' cannot be authenticated', status: 404 });
		return true;
	}
	chrome.identity.launchWebAuthFlow({ url:         _.result(api_config, 'client_auth_url', config.endpoint + '/' + message.api + '/authenticate?chromium_id=EXTENSION_ID')
	                                                  .replace('EXTENSION_ID', EXTENSION_ID),
	                                    interactive: true },
		function(redirect_url) {
			if (chrome.runtime.lastError) {
				return callback({ message: chrome.runtime.lastError.message, status: 401 });
			}
			var user = redirect_url && (redirect_url.split('#', 2)[1] || '').split('=', 2)[1];
			if (!user || !user.length) {
				return callback({ message: 'No user token returned for ' + message.api + ': ' + redirect_url, status:  500 });
			}
			var obj = {};
			obj[message.api + '_user'] = user;
			chrome.storage.sync.set(obj, function() {
				if (chrome.runtime.lastError) {
					return callback({ message: chrome.runtime.lastError.message, status:  500 });
				}
				callback();
			});
		});

	return true;
});
