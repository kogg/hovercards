var applyMiddleware = require('redux').applyMiddleware;
var combineReducers = require('redux').combineReducers;
var createStore     = require('redux').createStore;
var thunkMiddlware  = require('redux-thunk').default;

createStore = applyMiddleware(thunkMiddlware)(createStore);

module.exports = function(initialState) {
	var store = createStore(combineReducers({
		duh: function() {
			return 'duh';
		}
	}), initialState);

	if (!process.env.NODE_ENV) {
		console.log('store', store.getState());
		store.subscribe(function() {
			console.log('store', store.getState());
		});
	}

	return store;
};
