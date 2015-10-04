chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	if (message.type !== 'service') {
		return;
	}

	var old_callback = callback;
	callback = function(err, result) {
		old_callback([err, result]);
	};

	// FIXME Mock BS
	setTimeout(function() {
		callback(null, { some: 'thing' });
	}, 500 + 500 * Math.random());

	return true;
});
