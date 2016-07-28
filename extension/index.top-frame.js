var Provider = require('react-redux').Provider;
var React    = require('react');
var ReactDOM = require('react-dom');

var createStore = require('../redux/createStore.top-frame');
var Hovercards  = require('../components/Hovercards/Hovercards');

ReactDOM.render(
	<Provider store={createStore()}>
		<Hovercards />
	</Provider>,
	document.documentElement.insertBefore(document.createElement('div'), null)
);
