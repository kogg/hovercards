var _         = require('underscore');
var errors    = require('feathers-errors');
var isFSA     = require('flux-standard-action').isFSA;
var promisify = require('es6-promisify');

var chrome = global.chrome;

function makeFSA(action) {
	if (chrome.runtime.lastError) {
		return Promise.reject(chrome.runtime.lastError);
	}
	if (!isFSA(action) || !action.error || _.isError(action.payload)) {
		return Promise.resolve(action);
	}
	if (action.payload.type === 'FeathersError') {
		return Promise.resolve(Object.assign(
			{},
			action,
			{ payload: Object.assign(
				new errors.FeathersError(
					action.payload.message,
					action.payload.name,
					action.payload.code,
					action.payload.className,
					action.payload.data
				),
				{ errors: action.payload.errors, request: action.payload.request }
			) }
		));
	}
	return Promise.resolve(Object.assign({}, action, { payload: new Error(action.payload.message) }));
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
	wrapIt.obj[wrapIt.method] = _.wrap(wrapIt.obj[wrapIt.method], function(func) {
		return promisify(func).apply(this, _.rest(arguments))
			.then(makeFSA, makeFSA);
	});
});

chrome.runtime.onMessage.addListener = _.wrap(chrome.runtime.onMessage.addListener, function(addListener, listener) {
	return addListener.bind(chrome.runtime.onMessage)(function(action, sender, sendResponse) {
		return listener(makeFSA(action), sender, sendResponse);
	});
});

module.exports = chrome;
