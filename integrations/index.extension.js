var _        = require('underscore');
var Response = require('http-browserify/lib/response');

var browser            = require('../extension/browser');
var integrationsConfig = require('../integrations/config');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
Response.prototype.setEncoding = Response.prototype.setEncoding || _.noop; // FIXME substack/http-browserify#10

var clientIntegrations = {
	instagram:  require('./instagram'),
	reddit:     require('./reddit'),
	soundcloud: require('./soundcloud')
};

var integrations = {};

// Migrate auth to new auth
var newAuthKeys = { instagram_user: 'authentication.instagram', twitter_user: 'authentication.twitter' };
browser.storage.sync.get(_.keys(newAuthKeys)).then(function(items) {
	_.keys(newAuthKeys).forEach(function(key) {
		if (!items[key]) {
			return;
		}
		browser.storage.sync.remove(key);
		browser.storage.sync.set({ [newAuthKeys[key]]: items[key] });
	});
});

browser.storage.onChanged.addListener(function(changes, areaName) {
	if (areaName !== 'sync') {
		return;
	}
	_.pairs(changes).forEach(function(entry) {
		var key = entry[0].match(/^authentication\.(.+)/);
		if (!key) {
			return;
		}
		delete integrations[key[1]];
	});
});

module.exports = function(request) {
	var apiConfig = integrationsConfig.integrations[request.api];

	// FIXME #9
	return Promise.all([
		browser.storage.local.get({ device_id: _.times(25, _.partial(_.sample, ALPHANUMERIC, null)).join('') }),
		browser.storage.sync.get('authentication.' + request.api)
	])
		.then(function(storage) {
			switch ((storage['authentication.' + request.api] && apiConfig.authenticated_environment) || apiConfig.environment) {
				case 'client':
					// TODO shouldn't need config to be passed
					integrations[request.api] = integrations[request.api] || clientIntegrations[request.api](Object.assign({ device_id: storage.device_id, user: storage['authentication.' + request.api] }, apiConfig));
					return integrations[request.api][request.type](request);
				case 'server':
				default:
					console.log('what');
					return Promise.reject();
			}
		})
		.then(function(entity) {
			return Object.assign(entity, { loaded: Date.now() });
		})	;
};
