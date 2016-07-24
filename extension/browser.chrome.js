var _         = require('underscore');
var promisify = require('es6-promisify');

var chrome = global.chrome;

['get', 'getBytesInUse'].forEach(function(method) {
	chrome.storage.sync[method] = _.wrap(chrome.storage.sync[method], function(func, param) {
	// Chrome callbacks doesn't put an error as the first values, it uses chrome.runtime.lastError
	// So we're going to have to catch an "error", even though it isn't one.

		return promisify(func)(param).catch(function(value) {
			return chrome.runtime.lastError ? Promise.reject(chrome.runtime.lastError) : Promise.resolve(value);
		});
	});
});

['set', 'remove', 'clear'].forEach(function(method) {
	chrome.storage.sync[method] = _.wrap(chrome.storage.sync[method], function(func, param) {
		return promisify(func)(param).then(function() {
			return chrome.runtime.lastError ? Promise.reject(chrome.runtime.lastError) : Promise.resolve();
		});
	});
});

module.exports = chrome;
