var _               = require('underscore');
var applyMiddleware = require('redux').applyMiddleware;
var combineReducers = require('redux').combineReducers;
var createStore     = require('redux').createStore;
var thunkMiddlware  = require('redux-thunk').default;

var actions               = require('./actions.top-frame');
var authenticationReducer = require('./authentication.reducer');
var browser               = require('../extension/browser');
var entitiesReducer       = require('./entities.reducer');
var optionsReducer        = require('./options.reducer');

createStore = applyMiddleware(thunkMiddlware)(createStore);

module.exports = function(initialState) {
	var store = createStore(combineReducers({
		authentication: authenticationReducer,
		entities:       entitiesReducer,
		options:        optionsReducer
	}), initialState);

	if (!process.env.NODE_ENV) {
		require('./storelistener')(store);
	}

	authenticationReducer.attachStore(store);
	optionsReducer.attachStore(store);

	browser.runtime.onMessage.addListener(function(action, sender, sendResponse) {
		action.payload = (!action.error || _.isError(action.payload)) ?
			action.payload :
			_.extend(new Error(action.payload.message), action.payload);

		store.dispatch(actions[action.type](action.payload, sender)).then(sendResponse, sendResponse);

		return true;
	});

	return store;
};
