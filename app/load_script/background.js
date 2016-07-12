var $ = require('jquery');
var _ = require('underscore');

var scripts = {};

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	if (_.result(message, 'type') !== 'load_script') {
		return false;
	}
	if (scripts[message.url]) {
		callback([null, scripts[message.url]]);
		return true;
	}
	$.ajax({ url: message.url, dataType: 'text' })
		.done(function(data) {
			scripts[message.url] = data;
			callback([null, scripts[message.url]]);
		})
		.fail(function(jqXHR) {
			callback([
				_.chain(jqXHR)
					.result('responseJSON', {})
					.defaults({ message: jqXHR.statusText, status: jqXHR.status || 500 })
					.value()
			]);
		});

	return true;
});
