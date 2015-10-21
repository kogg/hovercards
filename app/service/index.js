var _            = require('underscore');
var network_urls = require('hovercardsshared/network-urls');

module.exports = function(identity, callback) {
	if (typeof identity === 'string') {
		identity = network_urls.identify(identity);
	}
	if (!identity) {
		return callback({ message: 'Missing \'identity\'', status: 400 });
	}
	chrome.runtime.sendMessage({ type: 'service', identity: identity }, function(combined_response) {
		if (chrome.runtime.lastError || _.isEmpty(combined_response)) {
			return callback(_.extend(chrome.runtime.lastError, { status: 500 }));
		}
		callback(combined_response[0], combined_response[1]);
	});
};
