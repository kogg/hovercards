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
		console.debug('store', store.getState());
		store.subscribe(function() {
			console.debug('store', store.getState());
		});
	}

	authenticationReducer.attachStore(store);

	browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		// TODO Have browser mutate this callback for us
		sendResponse = _.wrap(sendResponse, function(func) {
			return func(_.rest(arguments));
		});

		store.dispatch(actions[message.type](message.payload, sender)).then(
			_.partial(sendResponse, null),
			sendResponse
		);

		return true;
	});

	return store;
};
