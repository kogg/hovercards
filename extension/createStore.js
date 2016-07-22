var applyMiddleware = require('redux').applyMiddleware;
var createStore     = require('redux').createStore;
var thunkMiddlware  = require('redux-thunk').default;

var reducers = require('./reducers');

createStore = applyMiddleware(thunkMiddlware)(createStore);

module.exports = function(initialState) {
	var store = createStore(reducers, initialState);

	if (!process.env.NODE_ENV) {
		console.log('store', store.getState());
		store.subscribe(function() {
			console.log('store', store.getState());
		});
	}

	if (module.hot) {
		module.hot.accept('./reducers', function() {
			store.replaceReducer(require('./reducers'));
		});
	}

	return store;
};
