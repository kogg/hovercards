var applyMiddleware = require('redux').applyMiddleware;
var combineReducers = require('redux').combineReducers;
var createStore     = require('redux').createStore;
var thunkMiddlware  = require('redux-thunk').default;

var optionsReducer = require('./options.reducer');

createStore = applyMiddleware(thunkMiddlware)(createStore);

module.exports = function(initialState) {
	var store = createStore(combineReducers({
		options: optionsReducer
	}), initialState);

	if (!process.env.NODE_ENV) {
		require('./storelistener')(store);
	}

	optionsReducer.attachStore(store);

	return store;
};
