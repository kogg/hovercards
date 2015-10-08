var _   = require('underscore');
var $   = require('jquery');
var env = require('env');

var ALPHANUMERIC   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var REDDIT_KEY     = '0jXqEudQPqSL6w';
var SOUNDCLOUD_KEY = '78a827254bd7a5e3bba61aa18922bf2e';

var device_id;

function initialize_caller(api, opts) {
	opts = opts || {};
	var caller = {};

	function setup_server_caller() {
		_.each(['content', 'account'], function(type) {
			caller[type] = function(args, callback) {
				chrome.storage.sync.get(api + '_user', function(obj) {
					if (chrome.runtime.lastError) {
						return callback(chrome.runtime.lastError);
					}
					$.ajax({ url:     env.endpoint + '/' + api + '/' + type,
							 data:    args,
							 headers: { device_id: device_id, use: obj[api + '_user'] } })
						.done(function(data) {
							callback(null, data);
						})
						.fail(function(err) {
							callback(err);
						});
				});
			};
		});
	}

	if (opts.client) {
		chrome.storage.sync.get(api + '_user', function(obj) {
			if (chrome.runtime.lastError) {
				// TODO
				return;
			}
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
	if (chrome.runtime.lastError) {
		// TODO
		return;
	}
	if (chrome.runtime.lastError || !obj || !obj.device_id || !obj.device_id.length) {
		device_id = _.times(25, _.partial(_.sample, ALPHANUMERIC, null)).join('');
		chrome.storage.local.set({ device_id: device_id });
	} else {
		device_id = obj.device_id;
	}

	var api_callers = { imgur:      initialize_caller('imgur'),
	                    instagram:  initialize_caller('instagram',  { client: require('hovercardsshared/old-apis/instagram'),  client_on_auth: true }),
	                    reddit:     initialize_caller('reddit',     { client: require('hovercardsshared/old-apis/reddit'),     client_args: { key: REDDIT_KEY } }),
	                    soundcloud: initialize_caller('soundcloud', { client: require('hovercardsshared/old-apis/soundcloud'), client_args: { key: SOUNDCLOUD_KEY } }),
	                    twitter:    initialize_caller('twitter'),
	                    youtube:    initialize_caller('youtube') };

	chrome.runtime.onMessage.addListener(function(message, sender, callback) {
		if (_.result(message, 'type') !== 'service') {
			return;
		}
		var identity = message.identity;
		var api      = _.result(identity, 'api');
		var type     = _.result(identity, 'type');
		if (!api_callers || !api_callers[api] || !_.isFunction(api_callers[api][type])) {
			// FIXME
			return;
		}

		api_callers[api][type](_.omit(identity, 'api', 'type'), _.wrap(callback, function(callback) {
			callback(_.toArray(arguments).splice(1));
		}));

		return true;
	});
});
