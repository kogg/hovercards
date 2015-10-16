var $         = require('jquery');
var _         = require('underscore');
var analytics = require('../analytics');

$.authenticate = function(api, callback) {
	callback = _.wrap(callback, function(callback, err, response) {
		if (err) {
			err.message = 'Authentication - ' + (api && api.length ? api + ' - ' : '') + (err.message || 'No Explanation');
			analytics('send', 'exception', { exDescription: err.message, exFatal: false });
		}
		(callback || $.noop)(err, response);
	});
	if (!api || !api.length) {
		return callback({ message: 'Missing \'api\'', status: 400 });
	}
	chrome.runtime.sendMessage({ type: 'auth', api: api }, function(combined_response) {
		if (chrome.runtime.lastError || _.isEmpty(combined_response)) {
			return callback(_.extend(chrome.runtime.lastError, { status: 500 }));
		}
		callback(combined_response[0], combined_response[1]);
	});
};
