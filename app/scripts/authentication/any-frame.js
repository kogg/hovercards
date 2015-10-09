var $ = require('jquery');
var _ = require('underscore');

$.authenticate = function(api, callback) {
	callback = _.wrap(callback, function(callback, err, response) {
		if (err) {
			err.message = 'Authentication - ' + (api && api.length ? api + ' - ' : '') + (err.message || 'No Explanation');
			$.analytics('send', 'exception', { exDescription: err.message, exFatal: !err.status || err.status >= 500 });
		}
		callback(err, response);
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
