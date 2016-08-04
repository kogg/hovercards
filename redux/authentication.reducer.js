var _            = require('underscore');
var createAction = require('redux-actions').createAction;
var handleAction = require('redux-actions').handleAction;

var browser = require('../extension/browser');

var clearEntities     = createAction('CLEAR_ENTITIES');
var setAuthentication = createAction('SET_AUTHENTICATION');

module.exports = handleAction(
	'SET_AUTHENTICATION',
	{
		next: function(state, action) {
			if (action.payload.value === undefined) {
				browser.storage.sync.remove('authentication.' + action.payload.api);
				return _.omit(state, action.payload.api);
			}
			browser.storage.sync.set({ ['authentication.' + action.payload.api]: action.payload.value });
			return Object.assign({}, state, { [action.payload.api]: action.payload.value });
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
			store.dispatch(setAuthentication({ api: key[1], value: entry[1] }));
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
			store.dispatch(setAuthentication({ api: key[1], value: entry[1].newValue }));
			store.dispatch(clearEntities(key[1]));
		});
	});
};
