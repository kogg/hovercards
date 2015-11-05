var _ = require('underscore');

module.exports = function() {
	var args = _.toArray(arguments);
	chrome.runtime.sendMessage({ type: 'analytics', request: args }, (process.env.NODE_ENV !== 'production') && function() {
		if (_.chain(args).first(2).isEqual(['send', 'exception']).value()) {
			console.error('google analytics', args);
		} else {
			console.debug('google analytics', args);
		}
	});
};
