var _           = require('underscore');
var actions     = require('../redux/actions.top-frame');
var browser     = require('./browser');
var createStore = require('../redux/createStore.background'); // FIXME aksjdfhaslkjfhasldkjfhasdlfkjahsdflkjasdbf

var store = createStore();

if (!process.env.NODE_ENV) {
	console.log('store', store.getState());
	store.subscribe(function() {
		console.log('store', store.getState());
	});
}

browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	sendResponse = _.wrap(sendResponse, function(func) {
		return func(_.rest(arguments));
	});

	store.dispatch(actions[message.action].apply(actions, message.args || [])).then(
		_.partial(sendResponse, null),
		sendResponse
	);

	return true;
});
