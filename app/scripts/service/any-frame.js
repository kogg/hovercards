var $            = require('jquery');
var network_urls = require('hovercardsshared/old-apis/network-urls');

$.service = function(identity, callback) {
	if (typeof identity === 'string') {
		identity = network_urls.identify(identity);
	}
	if (!identity) {
		// FIXME
		return callback({ status: 400 });
	}
	chrome.runtime.sendMessage({ type: 'service', identity: identity }, function(combined_response) {
		if (chrome.runtime.lastError || !combined_response || !combined_response.length) {
			$.analytics('send', 'exception', { exDescription: (chrome.runtime.lastError && chrome.runtime.lastError.message) || 'Service Failed without Explanation',
			                                   exFatal: true });
			return callback({ 'our-problem': true });
		}
		callback(combined_response[0], combined_response[1]);
	});
};
