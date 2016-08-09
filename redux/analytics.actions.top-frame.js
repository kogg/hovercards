var _ = require('underscore');

var browser = require('../extension/browser');

module.exports.analytics = function(request) {
	return function() {
		var promise = browser.runtime.sendMessage({ type: 'analytics', payload: request });

		if (!process.env.GOOGLE_ANALYTICS_ID) {
			promise = promise
				.then(function() {
					if (_.chain(request).first(2).isEqual(['send', 'exception']).value()) {
						console.error('google analytics', request);
					} else {
						console.debug('google analytics', request);
					}
				});
		}
		return promise;
	};
};
