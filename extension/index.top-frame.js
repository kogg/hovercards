var _           = require('underscore');
var actions     = require('../redux/actions.top-frame');
var browser     = require('./browser');
var createStore = require('../redux/createStore.top-frame');

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

	store.dispatch(actions[message.type](message.payload)).then(
		_.partial(sendResponse, null),
		sendResponse
	);

	return true;
});

store.dispatch(actions.getEntity({ api: 'youtube', type: 'content', id: 'asdf' }));
