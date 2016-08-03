var _ = require('underscore');

var browser = require('../extension/browser');

module.exports.analytics = function(request) {
	return function() {
		var promise = browser.runtime.sendMessage({ type: 'analytics', payload: request });

		if (!process.env.GOOGLE_ANALYTICS_ID) {
			promise = promise
				.then(function(response) {
					if (_.chain(response).first(2).isEqual(['send', 'exception']).value()) {
						console.error('google analytics', response);
					} else {
						console.debug('google analytics', response);
					}
				});
		}
		// FIXME #9 Log "impossible" err
		return promise;
	};
};
