var _ = require('underscore');

module.exports = function(api, callback) {
	if (_.isEmpty(api)) {
		return setTimeout(function() {
			callback({ message: 'Missing \'api\'', status: 400 });
		});
	}
	chrome.runtime.sendMessage({ type: 'auth', api: api }, function(combined_response) {
		if (chrome.runtime.lastError || _.isEmpty(combined_response)) {
			return callback(_.extend(chrome.runtime.lastError, { status: 500 }));
		}
		callback(combined_response[0], combined_response[1]);
	});
};
