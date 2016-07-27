var Provider = require('react-redux').Provider;
var React    = require('react');
var ReactDOM = require('react-dom');

var createStore = require('../redux/createStore.top-frame');
var Hovercards  = require('../components/Hovercards/Hovercards');

var store = createStore();

var div = document.createElement('div');

document.documentElement.insertBefore(div, null);

ReactDOM.render(
	<Provider store={store}>
		<Hovercards />
	</Provider>,
	div
);
