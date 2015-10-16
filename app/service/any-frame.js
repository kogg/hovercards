var $            = require('jquery');
var _            = require('underscore');
var analytics    = require('../analytics');
var network_urls = require('hovercardsshared/network-urls');

$.service = function(identity, callback) {
	if (typeof identity === 'string') {
		identity = network_urls.identify(identity);
	}
	var service_start = Date.now();
	callback = _.wrap(callback, function(callback, err, response) {
		var label = identity && _.compact([identity.api, identity.type]).join(' ');
		if (err) {
			err.message = _.compact(['Service', label && label.length && label, err.status, err.message]).join(' - ');
			analytics('send', 'exception', { exDescription: err.message, exFatal: false });
		}
		analytics('send', 'timing', 'service', 'loading', Date.now() - service_start, label);
		callback(err, response);
	});
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
