var $         = require('jquery');
var _         = require('underscore');
var analytics = require('../analytics/background');
var async     = require('async');
var config    = require('../config');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

chrome.storage.local.get('device_id', function(obj) {
	if (!_.isEmpty((obj || {}).device_id)) {
		return;
	}
	chrome.storage.local.set({ device_id: _.times(25, _.partial(_.sample, ALPHANUMERIC, null)).join('') });
});

var api_callers = _.mapObject(config.apis, function(api_config, api) {
	var caller = {};

	function setup_server_caller() {
		_.extend(caller, _.mapObject({ content: null, discussion: null, account: null, account_content: null }, function(a, type) {
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

			var promises = {};

			return function(identity, callback) {
				async.parallel({
					device_id: function(callback) {
						chrome.storage.local.get('device_id', function(obj) {
							callback(null, (obj || {}).device_id);
						});
					},
					user_id: function(callback) {
						if (!api_config.can_auth) {
							return callback();
						}
						chrome.storage.sync.get(api + '_user', function(obj) {
							callback(null, (obj || {})[api + '_user']);
						});
					}
				}, function(err, results) {
					var key = JSON.stringify(_.chain(identity).omit('api', 'type').extend(results).value());

					var map_header = promises[key] ? _.constant(0) : Number;

					promises[key] = promises[key] || $.ajax({ url:      url(identity),
					                                          data:     _.omit(identity, 'api', 'type', 'id'),
					                                          dataType: 'json',
					                                          jsonp:    false,
					                                          headers:  results })
						.done(function() {
							setTimeout(function() {
								delete promises[key];
							}, api_config['route_cache_' + type] || api_config.route_cache_default || 5 * 60 * 1000);
						})
						.fail(function() {
							delete promises[key];
						});

					promises[key]
						.done(function(data, textStatus, jqXHR) {
							callback(null, data, _.chain(jqXHR.getAllResponseHeaders().trim().split('\n'))
							                      .invoke('split', /:\s*/, 2)
							                      .filter(function(pair) { return pair[0] !== (pair[0] = pair[0].replace(/^usage-/, '')); })
							                      .object()
							                      .mapObject(map_header)
							                      .value());
						})
						.fail(function(jqXHR) {
							callback(_.extend({ message: jqXHR.statusText, status: jqXHR.status || 500 }, jqXHR.responseJSON),
							         null,
							         _.chain(jqXHR.getAllResponseHeaders().trim().split('\n'))
							          .invoke('split', /:\s*/, 2)
							          .filter(function(pair) { return pair[0] !== (pair[0] = pair[0].replace(/^usage-/, '')); })
							          .object()
							          .mapObject(map_header)
							          .value());
						});
				});
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
			user_id: function(callback) {
				if (!api_config.can_auth) {
					return callback();
				}
				chrome.storage.sync.get(api + '_user', function(obj) {
					callback(null, (obj || {})[api + '_user']);
				});
			}
		}, function(err, results) {
			if (api_config.client_on_auth && _.isEmpty(results.user_id)) {
				setup_server_caller();
				return;
			}
			var client = api_config.caller(_.extend(results, api_config));
			_.extend(caller, _.pick(client, 'content', 'discussion', 'account', 'account_content'));
			_.extend(client.model, _.mapObject(client.model, function(func, name) {
				var promises = {};

				return function(args, args_not_cached, usage, callback) {
					var key = JSON.stringify(args);

					promises[key] = promises[key] || new Promise(function(resolve, reject) {
						func(args, args_not_cached, usage, function(err, result) {
							if (!err) {
								resolve(result);
							} else {
								reject(err);
							}
						});
					})
						.then(function(result) {
							setTimeout(function() {
								delete promises[key];
							}, api_config['cache_' + name] || api_config.cache_default || 5 * 60 * 1000);
							return result;
						})
						.catch(function(err) {
							delete promises[key];
							return err;
						});

					promises[key]
						.then(function(result) {
							callback(null, result);
						})
						.catch(function(err) {
							callback(err);
						});
				};
			}));
		});
	} else {
		setup_server_caller();
	}

	return caller;
});

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
		callback({ message: 'Do not recognize api ' + api, status: 404 });
	}

	return true;
});
