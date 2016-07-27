var actions     = require('../redux/actions.top-frame');
var createStore = require('../redux/createStore.top-frame');

var store = createStore();

if (!process.env.NODE_ENV) {
	console.log('store', store.getState());
	store.subscribe(function() {
		console.log('store', store.getState());
	});
}

store.dispatch(actions.getEntity({ api: 'youtube', type: 'content', id: 'Av8sn7BXLxE' }));
