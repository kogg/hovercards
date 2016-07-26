var _           = require('underscore');
var actions     = require('../redux/actions.background');
var browser     = require('./browser');
var createStore = require('../redux/createStore.background');

var store = createStore();

if (!process.env.NODE_ENV) {
	console.log('store', store.getState());
	store.subscribe(function() {
		console.log('store', store.getState());
	});
}

browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	// TODO Have browser mutate this callback for us
	sendResponse = _.wrap(sendResponse, function(func) {
		return func(_.rest(arguments));
	});

	store.dispatch(actions[message.type](message.payload, sender.tab.id)).then(
		_.partial(sendResponse, null),
		sendResponse
	);

	return true;
});
