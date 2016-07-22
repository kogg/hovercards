/* global chrome */
var _ = require('underscore');

module.exports = function() {
	var args = _.toArray(arguments);
	if (process.env.NODE_ENV === 'production') {
		chrome.runtime.sendMessage({ type: 'analytics', request: args });
	} else {
		chrome.runtime.sendMessage({ type: 'analytics', request: args }, function() {
			if (_.chain(args).first(2).isEqual(['send', 'exception']).value()) {
				console.error('google analytics', args);
			} else {
				console.debug('google analytics', args);
			}
		});
	}
};
