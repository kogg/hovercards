var _             = require('underscore');
var config        = require('../config');
var shared_config = require('hovercardsshared/config');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var auth_urls = { instagram: 'https://instagram.com/oauth/authorize/?client_id=' + config.apis.instagram.key +
                             '&redirect_uri=https://' + EXTENSION_ID + '.chromiumapp.org/callback' +
                             '&response_type=token' };

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
	if (!_.chain(shared_config).result('apis').result(message.api).result('can_auth').value()) {
		callback({ message: message.api + ' cannot be authenticated', status: 400 });
		return true;
	}
	chrome.identity.launchWebAuthFlow({ url:         auth_urls[message.api] || (config.endpoint + '/' + message.api + '/authenticate?chromium_id=' + EXTENSION_ID),
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
