var _         = require('underscore');
var isFSA     = require('flux-standard-action').isFSA;
var promisify = require('es6-promisify');

var chrome = global.chrome;

function handleRuntimeLastError(value) {
	if (chrome.runtime.lastError) {
		return Promise.reject({ payload: chrome.runtime.lastError, error: true });
	}
	if (isFSA(value)) {
		if (value.error) {
			value.payload = (_.isError(value.payload)) ? value.payload : Object.assign(new Error(value.payload.message), value.payload);
			return Promise.reject(value);
		}
	}
	return Promise.resolve(value);
}

function returnPromise(func) {
	return promisify(func).apply(this, _.rest(arguments)).then(handleRuntimeLastError, handleRuntimeLastError);
}

[
	{ obj: chrome.identity, method: 'launchWebAuthFlow' },
	{ obj: chrome.runtime, method: 'sendMessage' },
	{ obj: chrome.runtime, method: 'setUninstallURL' },
	{ obj: chrome.storage.local, method: 'clear' },
	{ obj: chrome.storage.local, method: 'get' },
	{ obj: chrome.storage.local, method: 'getBytesInUse' },
	{ obj: chrome.storage.local, method: 'remove' },
	{ obj: chrome.storage.local, method: 'set' },
	{ obj: chrome.storage.sync, method: 'clear' },
	{ obj: chrome.storage.sync, method: 'get' },
	{ obj: chrome.storage.sync, method: 'getBytesInUse' },
	{ obj: chrome.storage.sync, method: 'remove' },
	{ obj: chrome.storage.sync, method: 'set' },
	{ obj: chrome.tabs, method: 'sendMessage' }
].forEach(function(wrapIt) {
	if (!wrapIt.obj || !wrapIt.obj[wrapIt.method]) {
		return;
	}
	wrapIt.obj[wrapIt.method] = _.wrap(wrapIt.obj[wrapIt.method], returnPromise);
});

module.exports = chrome;
