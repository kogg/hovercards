/* global chrome */
var $         = require('jquery');
var _         = require('underscore');
var analytics = require('../analytics/background');
var async     = require('async');
var config    = require('../config');
var memoize   = require('memoizee');
var Response  = require('http-browserify/lib/response');
require('../common/mixins');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// FIXME substack/http-browserify#10
Response.prototype.setEncoding = _.noop;

chrome.storage.local.get('device_id', function(obj) {
	if (!_.isEmpty((obj || {}).device_id)) {
		return;
	}
	chrome.storage.local.set({ device_id: _.times(25, _.partial(_.sample, ALPHANUMERIC, null)).join('') });
});

_.each({
	// TODO Do this without moving it into config.js
	instagram:  require('../../shared/instagram'),
	reddit:     require('../../shared/reddit'),
	soundcloud: require('../../shared/soundcloud')
}, function(caller, api) {
	if (!config.apis[api]) {
		return;
	}
	config.apis[api].caller = caller;
});

var api_callers = _.mapObject(config.apis, function(api_config, api) {
	var caller = {};

	function setup_server_caller() {
		_.extend(caller, _.mapObject({ content: null, discussion: null, account: null, account_content: null }, function(a, type) {
			var ajax_call = memoize(function(identity_as_string, url, callback) {
				var identity = JSON.parse(identity_as_string);
				async.parallel({
					device_id: function(callback) {
						chrome.storage.local.get('device_id', function(obj) {
							callback(null, (obj || {}).device_id);
						});
					},
					user: function(callback) {
						if (!api_config.can_auth) {
							return async.setImmediate(callback);
						}
						chrome.storage.sync.get(api + '_user', function(obj) {
							callback(null, (obj || {})[api + '_user']);
						});
					}
				}, function(err, results) {
					$.ajax({
						url:      url,
						data:     identity,
						dataType: 'json',
						jsonp:    false,
						headers:  results
					})
						.done(function(data, textStatus, jqXHR) {
							callback(null, data, _.chain(jqXHR.getAllResponseHeaders().trim().split('\n'))
								.invoke('split', /:\s*/, 2)
								.filter(function(pair) {
									return pair[0] !== (pair[0] = pair[0].replace(/^usage-/, ''));
								})
								.object()
								.mapObject(Number)
								.value());
						})
						.fail(function(jqXHR) {
							callback(
								_.chain(jqXHR)
									.result('responseJSON', {})
									.defaults({ message: jqXHR.statusText, status: jqXHR.status || 500 })
									.value(),
								null,
								_.chain(jqXHR.getAllResponseHeaders().trim().split('\n'))
									.invoke('split', /:\s*/, 2)
									.filter(function(pair) {
										return pair[0] !== (pair[0] = pair[0].replace(/^usage-/, ''));
									})
									.object()
									.mapObject(Number)
									.value());
						});
				});
			}, {
				maxAge:    api_config['route_cache_' + type] || api_config.route_cache_default || 5 * 60 * 1000,
				resolvers: [JSON.stringify],
				length:    2,
				async:     true
			});

			return function(identity, callback) {
				var url;
				switch (_.result(identity, 'type')) {
					case 'content':
					case 'account':
						url = [config.endpoint, api, identity.type, identity.id].join('/');
						break;
					case 'discussion':
						if (identity.for) {
							url = [config.endpoint, identity.for.api, 'content', identity.for.id, 'discussion', api].join('/');
						} else {
							url = [config.endpoint, api, 'content', identity.id, 'discussion'].join('/');
						}
						break;
					case 'account_content':
						url = [config.endpoint, api, 'account', identity.id, 'content'].join('/');
						break;
					default:
						break;
				}
				if (_.isObject(identity.for)) {
					var for_api = identity.for.api;
					identity.for = _.pick(identity.for, 'as', 'account');
					identity.for.account = _.pick(identity.for.account, 'id', 'as');
					if (!_.contains(['soundcloud', 'twitter'], for_api) || _.isEmpty(identity.for.account)) {
						delete identity.for.account;
					}
					if (_.isEmpty(identity.for)) {
						delete identity.for;
					}
				}
				identity = _.pick(identity, 'as', 'account', 'for');
				identity.account = _.pick(identity.account, 'id', 'as', 'account');
				if (!_.contains(['soundcloud', 'twitter'], api) || _.isEmpty(identity.account)) {
					delete identity.account;
				}

				ajax_call(identity, url, callback);
			};
		}));
	}

	if (api_config.caller) {
		async.parallel({
			device_id: function(callback) {
				chrome.storage.local.get('device_id', function(obj) {
					callback(null, (obj || {}).device_id);
				});
			},
			user: function(callback) {
				if (!api_config.can_auth) {
					return async.setImmediate(callback);
				}
				chrome.storage.sync.get(api + '_user', function(obj) {
					callback(null, (obj || {})[api + '_user']);
				});
			}
		}, function(err, results) {
			function setup_caller(results) {
				if (api_config.client_on_auth && _.isEmpty(results.user)) {
					setup_server_caller();
					return;
				}
				var client = api_config.caller(_.extend(results, api_config));
				_.extend(caller, _.pick(client, 'content', 'discussion', 'account', 'account_content'));
				_.extend(client.model, _.mapObject(client.model, function(func, name) {
					return memoize(function(args_as_string, args_not_cached, usage, callback) {
						func(JSON.parse(args_as_string), args_not_cached, usage, callback);
					}, {
						maxAge:    api_config['cache_' + name] || api_config.cache_default || 5 * 60 * 1000,
						resolvers: [JSON.stringify],
						length:    1,
						async:     true
					});
				}));
			}
			setup_caller(results);
			chrome.storage.onChanged.addListener(function(changes, namespace) {
				if (namespace !== 'sync' || !((api + '_user') in changes)) {
					return;
				}
				setup_caller(_.extend(results, { user: changes[api + '_user'].newValue }));
			});
		});
	} else {
		setup_server_caller();
	}

	return caller;
});

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	if (_.result(message, 'type') !== 'service') {
		return false;
	}
	var service_start = Date.now();
	var identity = message.identity;
	var api      = _.result(identity, 'api');
	var type     = _.result(identity, 'type');
	var label = _.analytics_label(identity);
	callback = _.wrap(callback, function(callback, err, response, usage) {
		_.each(usage, function(val, key) {
			console.log(key, val);
		});
		if (err) {
			err.message = _.compact(['Service', !_.isEmpty(label) && label, err.status + (err.original_status ? ' (' + err.original_status + ')' : ''), err.message]).join(' - ');
			analytics('send', 'exception', { exDescription: err.message, exFatal: false });
		}
		analytics('send', 'timing', 'service', 'loading', Date.now() - service_start, label);
		callback([err, response]);
	});
	if (api_callers[api]) {
		api_callers[api][type](identity, callback);
	} else {
		callback({ message: 'Do not recognize api ' + api, status: 404 });
	}

	return true;
});
