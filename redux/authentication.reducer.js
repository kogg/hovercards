var _            = require('underscore');
var handleAction = require('redux-actions').handleAction;

var actions = require('./actions.common'); // TODO webpack/webpack#2801
var browser = require('../extension/browser');

module.exports = handleAction(
	'SET_AUTHENTICATION',
	{
		next: function(state, action) {
			if (action.payload.value === undefined) {
				browser.storage.sync.remove('authentication.' + action.payload.api);
				return _.omit(state, action.payload.api);
			}
			browser.storage.sync.set({ ['authentication.' + action.payload.api]: action.payload.value });
			return _.defaults({ [action.payload.api]: action.payload.value }, state);
		}
	},
	{}
);

module.exports.attachStore = function(store) {
	browser.storage.sync.get(null).then(function(items) {
		_.pairs(items).forEach(function(entry) {
			var key = entry[0].match(/^authentication\.(.+)/);
			if (!key) {
				return;
			}
			store.dispatch(actions.setAuthentication({ api: key[1], value: entry[1] }));
		});
	});

	browser.storage.onChanged.addListener(function(changes, areaName) {
		if (areaName !== 'sync') {
			return;
		}
		_.pairs(changes).forEach(function(entry) {
			var key = entry[0].match(/^authentication\.(.+)/);
			if (!key) {
				return;
			}
			store.dispatch(actions.setAuthentication({ api: key[1], value: entry[1].newValue }));
		});
	});
};
