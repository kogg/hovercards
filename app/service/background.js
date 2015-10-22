var $         = require('jquery');
var _         = require('underscore');
var analytics = require('../analytics/background');
var config    = require('../config');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

var device_id;

function initialize_caller(api_config, api) {
	var caller = {};

	function setup_server_caller() {
		_.each(['content', 'discussion', 'account', 'account_content'], function(type) {
			var url;
			switch (type) {
				case 'content':
				case 'account':
					url = function(identity) {
						return [config.endpoint, api, type, identity.id].join('/');
					};
					break;
				case 'discussion':
					url = function(identity) {
						if (identity['for']) {
							return [config.endpoint, identity['for'].api, 'content', identity['for'].id, 'discussion', api].join('/');
						}
						return [config.endpoint, api, 'content', identity.id, 'discussion'].join('/');
					};
					break;
				case 'account_content':
					url = function(identity) {
						return [config.endpoint, api, 'account', identity.id, 'content'].join('/');
					};
					break;
			}
			caller[type] = function(identity, callback) {
				(function(callback) {
					if (!api_config.can_auth) {
						return callback();
					}
					chrome.storage.sync.get(api + '_user', function(obj) {
						callback((obj || {})[api + '_user']);
					});
				})(function(user_id) {
					$.ajax({ url:      url(identity),
					         data:     _.omit(identity, 'api', 'type', 'id'),
					         dataType: 'json',
					         jsonp:    false,
					         headers:  { device_id: device_id, user: user_id } })
						.done(function(data, textStatus, jqXHR) {
							callback(null, data, _.chain(jqXHR.getAllResponseHeaders().trim().split('\n'))
							                      .invoke('split', /:\s*/, 2)
							                      .filter(function(pair) { return pair[0] !== (pair[0] = pair[0].replace(/^usage-/, '')); })
							                      .object()
							                      .mapObject(Number)
							                      .value());
						})
						.fail(function(jqXHR) {
							callback(_.defaults(jqXHR.responseJSON, { message: jqXHR.statusText, status: jqXHR.status || 500 }),
							         null,
							         _.chain(jqXHR.getAllResponseHeaders().trim().split('\n'))
							          .invoke('split', /:\s*/, 2)
							          .filter(function(pair) { return pair[0] !== (pair[0] = pair[0].replace(/^usage-/, '')); })
							          .object()
							          .mapObject(Number)
							          .value());
						});
				});
			};
		});
	}

	if (api_config.caller) {
		(function(callback) {
			if (!api_config.can_auth) {
				return callback();
			}
			chrome.storage.sync.get(api + '_user', function(obj) {
				callback((obj || {})[api + '_user']);

				chrome.storage.onChanged.addListener(function(changes, area_name) {
					if (area_name !== 'sync' || !((api + '_user') in changes)) {
						return;
					}
					callback((changes[api + '_user'] || {}).newValue);
				});
			});
		})(function(user_id) {
			if (api_config.client_on_auth && _.isEmpty(user_id)) {
				setup_server_caller();
				return;
			}
			var client = api_config.caller(_.extend({ device: device_id, user: user_id }, api_config));
			_.extend(caller, _.pick(client, 'content', 'discussion', 'account', 'account_content'));
		});
	} else {
		setup_server_caller();
	}

	return caller;
}

chrome.storage.local.get('device_id', function(obj) {
	obj = obj || {};
	if (!obj.device_id || !obj.device_id.length) {
		device_id = _.times(25, _.partial(_.sample, ALPHANUMERIC, null)).join('');
		chrome.storage.local.set({ device_id: device_id });
	} else {
		device_id = obj.device_id;
	}

	var api_callers = _.chain(config.apis)
	                   .mapObject(_.clone)
	                   .mapObject(initialize_caller)
	                   .value();

	chrome.runtime.onMessage.addListener(function(message, sender, callback) {
		if (_.result(message, 'type') !== 'service') {
			return;
		}
		var service_start = Date.now();
		var identity = message.identity;
		var api      = _.result(identity, 'api');
		var type     = _.result(identity, 'type');
		callback = _.wrap(callback, function(callback, err, response, usage) {
			var label = _.compact([api, type]).join(' ');
			_.each(usage, function(val, key) {
				console.log(key, val);
			});
			if (err) {
				err.message = _.compact(['Service', !_.isEmpty(label) && label, err.status, err.message]).join(' - ');
				analytics('send', 'exception', { exDescription: err.message, exFatal: false });
			}
			analytics('send', 'timing', 'service', 'loading', Date.now() - service_start, label);
			callback([err, response]);
		});
		if (api_callers[api]) {
			api_callers[api][type](identity, callback);
		} else {
			callback({ message: 'Do not recognize api \'' + api + '\'', status: 501 });
		}

		return true;
	});
});
