var _           = require('underscore');
var querystring = require('querystring');
var Response    = require('http-browserify/lib/response');

var browser            = require('../extension/browser');
var integrationsConfig = require('../integrations/config');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
Response.prototype.setEncoding = Response.prototype.setEncoding || _.noop; // FIXME substack/http-browserify#10

var clientIntegrations = {
	instagram:  require('./instagram'),
	reddit:     require('./reddit'),
	soundcloud: require('./soundcloud')
};

var integrations   = {};
var serverEndpoint = 'http://' + (process.env.NODE_ENV === 'production' ? 'hover.cards' : 'localhost:5100') + '/v2/';

// Migrate auth to new auth
var newAuthKeys = { instagram_user: 'authentication.instagram', twitter_user: 'authentication.twitter' };
// FIXME #9
browser.storage.sync.get(_.keys(newAuthKeys)).then(function(items) {
	_.keys(newAuthKeys).forEach(function(key) {
		if (!items[key]) {
			return;
		}

		return Promise.all([
			browser.storage.sync.remove(key),
			browser.storage.sync.set({ [newAuthKeys[key]]: items[key] })
		]);
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
	var integrationConfig = integrationsConfig.integrations[request.api];

	// FIXME #9
	return Promise.all([
		browser.storage.local.get('device_id')
			.then(_.property('device_id'))
			.then(function(device_id) {
				if (device_id) {
					return device_id;
				}

				device_id = _.times(25, _.partial(_.sample, ALPHANUMERIC, null)).join('');
				return browser.storage.local.set({ device_id: device_id }).then(_.constant(device_id));
			}),
		browser.storage.sync.get('authentication.' + request.api).then(_.property('authentication.' + request.api))
	])
		.then(function(storage) {
			switch ((storage[1] && integrationConfig.authenticated_environment) || integrationConfig.environment) {
				case 'client':
					// TODO shouldn't need config to be passed
					integrations[request.api] = integrations[request.api] || clientIntegrations[request.api](Object.assign({ device_id: storage[0], user: storage[1] }, integrationConfig));
					return integrations[request.api][request.type](request);
				case 'server':
				default:
					var url = serverEndpoint;
					switch (request.type) {
						case 'content':
						case 'account':
							url += [request.api, request.type, request.id].join('/');
							break;
						case 'discussion':
							if (request.for) {
								url += [request.for.api, 'content', request.for.id, 'discussion', request.api].join('/');
								var for_api = request.for.api;
								request = _.clone(request);
								request.for = _.pick(request.for, 'as', 'account');
								request.for.account = _.pick(request.for.account, 'id', 'as');
								if (!_.contains(['soundcloud', 'twitter'], for_api) || _.isEmpty(request.for.account)) {
									// TODO Why?
									delete request.for.account;
								}
								if (_.isEmpty(request.for)) {
									delete request.for;
								}
							} else {
								url += [request.api, 'content', request.id, 'discussion'].join('/');
							}
							break;
						case 'account_content':
							url += [request.api, 'account', request.id, 'content'].join('/');
							break;
						default:
							break;
					}
					var request_api = request.api;
					request = _.pick(request, 'as', 'account', 'for');
					request.account = _.pick(request.account, 'id', 'as', 'account');
					if (!_.contains(['soundcloud', 'twitter'], request_api) || _.isEmpty(request.account)) {
						// TODO Why?
						delete request.account;
					}
					return fetch(url + '?' + querystring.stringify(request), {
						headers: _.omit(
							{
								device_id: storage[0],
								user:      storage[1]
							},
							_.isUndefined
						)
					})
						.then(function(response) {
							if (!response.ok) {
								var err = new Error(response.statusText);
								err.status = response.status;
								return Promise.reject(err);
							}
							return response.json();
						});
			}
		})
		.then(function(entity) {
			return Object.assign(entity, { loaded: Date.now() });
		});
};
