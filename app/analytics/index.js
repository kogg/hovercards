var _ = require('underscore');

module.exports = function() {
	var args = _.toArray(arguments);
	chrome.runtime.sendMessage({ type: 'analytics', request: args }, (process.env.NODE_ENV !== 'production') && function() {
		console.debug('google analytics', args);
	});
};
