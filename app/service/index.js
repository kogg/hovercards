var _ = require('underscore');

module.exports = function(identity, callback) {
	if (!_.isObject(identity)) {
		return setImmediate(function() {
			callback({ message: 'Missing \'identity\'', status: 400 });
		});
	}
	chrome.runtime.sendMessage({ type: 'service', identity: identity }, function(combined_response) {
		if (chrome.runtime.lastError || _.isEmpty(combined_response)) {
			return callback(_.extend(chrome.runtime.lastError, { status: 500 }));
		}
		callback(combined_response[0], combined_response[1]);
	});
};
