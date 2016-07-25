var _               = require('underscore');
var applyMiddleware = require('redux').applyMiddleware;
var createStore     = require('redux').createStore;
var thunkMiddlware  = require('redux-thunk').default;

var actions = require('./actions');
var browser = require('../extension/browser');

createStore = applyMiddleware(thunkMiddlware)(createStore);

module.exports = function(reducers, initialState) {
	var store = createStore(reducers, initialState);

	if (!process.env.NODE_ENV) {
		console.log('store', store.getState());
		store.subscribe(function() {
			console.log('store', store.getState());
		});
	}

	if (module.hot) {
		module.hot.accept('./options.reducer', function() {
			store.replaceReducer(require('./options.reducer'));
		});
	}

	browser.storage.sync.get(null).then(function(items) {
		if (items.disabled) {
			['imgur', 'instagram', 'reddit', 'soundcloud', 'twitter', 'youtube'].forEach(function(integration) {
				if (!items.disabled[integration]) {
					return;
				}
				['content', 'account'].forEach(function(type) {
					if (!items.disabled[integration][type]) {
						return;
					}
					store.dispatch(actions.setOption([integration, type, 'enabled'].join('.'), !items.disabled[integration][type]));
				});
			});
			browser.storage.sync.remove('disabled');
		}
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
