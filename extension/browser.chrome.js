var _         = require('underscore');
var promisify = require('es6-promisify');

var chrome = global.chrome;

chrome.storage.sync.set = _.wrap(chrome.storage.sync.set, function(set, items) {
	return promisify(set)(items).then(function(value) {
		return chrome.runtime.lastError ? Promise.reject(chrome.runtime.lastError) : value;
	});
});

module.exports = chrome;
