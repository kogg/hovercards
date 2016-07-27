var createStore = require('../redux/createStore.background');

var store = createStore();

if (!process.env.NODE_ENV) {
	console.log('store', store.getState());
	store.subscribe(function() {
		console.log('store', store.getState());
	});
}
