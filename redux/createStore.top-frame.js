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
		console.debug('store', store.getState());
		store.subscribe(function() {
			console.debug('store', store.getState());
		});
	}

	authenticationReducer.attachStore(store);
	optionsReducer.attachStore(store);

	browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		// TODO Have browser mutate this callback for us
		sendResponse = _.wrap(sendResponse, function(func) {
			return func(_.rest(arguments));
		});

		store.dispatch(actions[message.type](message.payload)).then(
			_.partial(sendResponse, null),
			sendResponse
		);

		return true;
	});

	return store;
};
