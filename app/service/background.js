var $         = require('jquery');
var _         = require('underscore');
var analytics = require('../analytics/background');
var config    = require('../config');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

var device_id;

function initialize_caller(api, client) {
	var caller = {};

	if (client) {
		chrome.storage.sync.get(api + '_user', function(obj) {
			obj = obj || {};
			var user_id = obj.user_id;
			function setup_client_caller() {
				if (config.apis[api].client_on_auth && _.isEmpty(user_id)) {
					_.extend(caller, { content: null, discussion: null, account: null, account_content: null });
					return;
				}
				var client = client(_.extend({ device: device_id, user: user_id }, config.apis[api]));
				_.extend(caller, _.pick(client, 'content', 'discussion', 'account', 'account_content'));
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
		_.extend(caller, { content: null, discussion: null, account: null, account_content: null });
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

	var api_callers = _.chain({
	                       // TODO Find a way to dynamically do this. Browserify Transform?
	                       // instagram:  require('hovercardsshared/instagram'),
	                       // reddit:     require('hovercardsshared/reddit'),
	                       // soundcloud: require('hovercardsshared/soundcloud')
	                   })
	                   .defaults(_.mapObject(config.apis, _.constant(null)))
	                   .mapObject(function(client, api) {
	                       return initialize_caller(api, client);
	                   })
	                   .value();

	chrome.runtime.onMessage.addListener(function(message, sender, callback) {
		if (_.result(message, 'type') !== 'service') {
			return;
		}
		var service_start = Date.now();
		var identity = message.identity;
		var api      = _.result(identity, 'api');
		var type     = _.result(identity, 'type');
		callback = _.wrap(callback, function(callback, err, response) {
			var label = _.compact([api, type]).join(' ');
			if (err) {
				err.message = _.compact(['Service', !_.isEmpty(label) && label, err.status, err.message]).join(' - ');
				analytics('send', 'exception', { exDescription: err.message, exFatal: false });
			}
			analytics('send', 'timing', 'service', 'loading', Date.now() - service_start, label);
			callback([err, response]);
		});
		if (api_callers[api] && _.isFunction(api_callers[api][type])) {
			api_callers[api][type](identity, callback);
		} else {
			chrome.storage.sync.get(api + '_user', function(obj) {
				$.ajax({ url:      [config.endpoint, api, type, identity.id].join('/'),
				         data:     _.omit(identity, 'api', 'type', 'id'),
				         dataType: 'json',
				         jsonp:    false,
				         headers:  { device_id: device_id, user: _.result(obj, api + '_user') } })
					.done(function(data) {
						callback(null, data);
					})
					.fail(function(err) {
						callback(err.responseJSON || { message: err.statusText, status: err.status || 500 });
					});
			});
		}

		return true;
	});
});
