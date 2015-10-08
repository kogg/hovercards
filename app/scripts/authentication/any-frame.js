var $ = require('jquery');

$.authenticate = function(api, callback) {
	if (!api) {
		// FIXME
		return callback({ status: 400 });
	}
	chrome.runtime.sendMessage({ type: 'auth', api: api }, function(combined_response) {
		if (chrome.runtime.lastError || !combined_response || !combined_response.length) {
			$.analytics('send', 'exception', { exDescription: (chrome.runtime.lastError && chrome.runtime.lastError.message) || 'Authentcation Failed without Explanation',
			                                   exFatal: true });
			return callback({ 'our-problem': true });
		}
		callback(combined_response[0], combined_response[1]);
	});
};
