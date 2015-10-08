var _   = require('underscore');
var env = require('env');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var auth_urls = { instagram: 'https://instagram.com/oauth/authorize/?client_id=41e56061c1e34fbbb16ab1d095dad78b' +
                             '&redirect_uri=https://' + EXTENSION_ID + '.chromiumapp.org/callback' +
                             '&response_type=token' };

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	if (_.result(message, 'type') !== 'auth') {
		return;
	}
	if (!message.api) {
		// FIXME
		return;
	}
	callback = _.wrap(callback, function(callback) {
		callback(_.toArray(arguments).splice(1));
	});
	chrome.identity.launchWebAuthFlow({ url:         auth_urls[message.api] || (env.endpoint + '/' + message.api + '/authenticate?chromium_id=' + EXTENSION_ID),
	                                    interactive: true }, function(redirect_url) {
		if (chrome.runtime.lastError) {
			return callback(_.defaults({ status: 401 }, chrome.runtime.lastError));
		}
		var user = redirect_url && (redirect_url.split('#', 2)[1] || '').split('=', 2)[1];
		if (!user) {
			// FIXME
			return callback({ status: 401 });
		}
		var obj = {};
		obj[message.api + '_user'] = user;
		chrome.storage.sync.set(obj, function() {
			callback(chrome.runtime.lastError);
		});
	});

	return true;
});
