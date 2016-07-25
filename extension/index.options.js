var Provider = require('react-redux').Provider;
var React    = require('react');
var ReactDOM = require('react-dom');

var createStore = require('../redux/createStore.options');
var Options     = require('../components/Options/Options');

var store = createStore();

if (!process.env.NODE_ENV) {
	console.log('store', store.getState());
	store.subscribe(function() {
		console.log('store', store.getState());
	});
}

ReactDOM.render(
	<Provider store={store}>
		<Options />
	</Provider>,
	global.document.getElementById('mount')
);
