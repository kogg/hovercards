var _               = require('underscore');
var applyMiddleware = require('redux').applyMiddleware;
var combineReducers = require('redux').combineReducers;
var createStore     = require('redux').createStore;
var thunkMiddlware  = require('redux-thunk').default;

var actions = require('./actions.top-frame'); // FIXME Boo
var browser = require('../extension/browser');

createStore = applyMiddleware(thunkMiddlware)(createStore);

module.exports = function(initialState) {
	var store = createStore(combineReducers({
		entities: require('./entities.reducer'),
		options:  require('./options.reducer')
	}), initialState);

	browser.storage.sync.get(null).then(function(items) {
		_.pairs(items).forEach(function(entry) {
			var key = entry[0].match(/^options\.(.+)/);
			if (!key) {
				return;
			}
			store.dispatch(actions.setOption(key[1], entry[1]));
		});
	});

	browser.storage.onChanged.addListener(function(changes, areaName) {
		if (areaName !== 'sync') {
			return;
		}
		_.pairs(changes).forEach(function(entry) {
			var key = entry[0].match(/^options\.(.+)/);
			if (!key) {
				return;
			}
			store.dispatch(actions.setOption(key[1], entry[1].newValue));
		});
	});

	return store;
};
