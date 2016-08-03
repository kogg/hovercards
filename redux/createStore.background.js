var _               = require('underscore');
var applyMiddleware = require('redux').applyMiddleware;
var combineReducers = require('redux').combineReducers;
var createStore     = require('redux').createStore;
var thunkMiddlware  = require('redux-thunk').default;

var actions               = require('./actions.background');
var authenticationReducer = require('./authentication.reducer');
var browser               = require('../extension/browser');
var entitiesReducer       = require('./entities.reducer');

createStore = applyMiddleware(thunkMiddlware)(createStore);

module.exports = function(initialState) {
	var store = createStore(combineReducers({
		authentication: authenticationReducer,
		entities:       entitiesReducer
	}), initialState);

	if (!process.env.NODE_ENV) {
		require('./storelistener')(store);
	}

	authenticationReducer.attachStore(store);

	browser.runtime.onMessage.addListener(function(action, sender, sendResponse) {
		action.payload = (!action.error || _.isError(action.payload)) ?
			action.payload :
			Object.assign(new Error(action.payload.message), action.payload);

		store.dispatch(actions[action.type](action.payload, action.meta, sender)).then(sendResponse, sendResponse);

		return true;
	});

	return store;
};
