var _ = require('underscore');

var APIS = { imgur:      true,
             instagram:  true,
             reddit:     true,
             soundcloud: true,
             twitter:    true,
             youtube:    true };

var api_callers = _.mapObject(APIS, function(/* val, api */) {
	return {
		content: function(args, callback) {
			// FIXME Mock BS
			setTimeout(function() {
				callback(null, { some: 'thing' });
			}, 500 + 500 * Math.random());
		},
		account: function(args, callback) {
			// FIXME Mock BS
			setTimeout(function() {
				callback(null, { some: 'thing' });
			}, 500 + 500 * Math.random());
		}
	};
});

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	if (!message || message.type !== 'service' || !message.identity || !api_callers[message.identity.api] || !api_callers[message.identity.api][message.identity.type]) {
		return;
	}

	api_callers[message.identity.api][message.identity.type](message.identity, _.wrap(callback, function(callback, err, result) {
		callback([err, result]);
	}));

	return true;
});
