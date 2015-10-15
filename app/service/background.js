var _      = require('underscore');
var $      = require('jquery');
var config = require('../config');

var ALPHANUMERIC   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

var device_id;

function initialize_caller(api, opts) {
	opts = opts || {};
	var caller = {};

	function setup_server_caller() {
		_.each(['content', 'account'], function(type) {
			caller[type] = function(args, callback) {
				chrome.storage.sync.get(api + '_user', function(obj) {
					obj = obj || {};
					$.ajax({ url:      config.endpoint + '/' + api + '/' + type + '/' + args.id,
					         data:     _.omit(args, 'api', 'type', 'id'),
					         dataType: 'json',
					         jsonp:    false,
					         headers:  { device_id: device_id, user: obj[api + '_user'] } })
						.done(function(data) {
							callback(null, data);
						})
						.fail(function(err) {
							callback(err.responseJSON || { message: err.statusText, status: err.status || 500 });
						});
				});
			};
		});
	}

	if (opts.client) {
		chrome.storage.sync.get(api + '_user', function(obj) {
			obj = obj || {};
			var user_id = obj.user_id;
			function setup_client_caller() {
				if (opts.client_on_auth && (!user_id || !user_id.length)) {
					return setup_server_caller();
				}
				var client = opts.client(_.extend({ device: device_id, user: user_id }, opts.client_args));
				_.each(['content', 'account'], function(type) {
					caller[type] = client[type];
				});
			}

			setup_client_caller();
			chrome.storage.onChanged.addListener(function(changes, area_name) {
				if (area_name !== 'sync' || !((api + '_user') in changes)) {
					return;
				}
				user_id = changes[api + '_user'].newValue;
				setup_client_caller();
			});
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

	var api_callers = { imgur:      initialize_caller('imgur'),
/*
	                    instagram:  initialize_caller('instagram',  { client: require('hovercardsshared/instagram'),  client_on_auth: true }),
	                    reddit:     initialize_caller('reddit',     { client: require('hovercardsshared/reddit'),     client_args: { key: config.reddit_key } }),
	                    soundcloud: initialize_caller('soundcloud', { client: require('hovercardsshared/soundcloud'), client_args: { key: config.soundcloud_key } }),
*/
	                    instagram:  initialize_caller('instagram'),
	                    reddit:     initialize_caller('reddit'),
	                    soundcloud: initialize_caller('soundcloud'),
	                    twitter:    initialize_caller('twitter'),
	                    youtube:    initialize_caller('youtube') };

	chrome.runtime.onMessage.addListener(function(message, sender, callback) {
		if (_.result(message, 'type') !== 'service') {
			return;
		}
		callback = _.wrap(callback, function(callback, err, response) {
			callback([err, response]);
		});
		var identity = message.identity;
		var api      = _.result(identity, 'api');
		var type     = _.result(identity, 'type');
		if (api_callers[api] && _.isFunction(api_callers[api][type])) {
			api_callers[api][type](identity, callback);
		} else {
			callback({ message: 'Unable to handle identity', status: 500 });
		}

		return true;
	});
});
