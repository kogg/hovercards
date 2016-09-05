require('../report');
var Provider = require('react-redux').Provider;
var React    = require('react');
var ReactDOM = require('react-dom');

var Hovercards  = require('../components/Hovercards/Hovercards');
var createStore = require('../redux/createStore.top-frame');

var element = document.documentElement.insertBefore(document.createElement('div'), null);
element.className = 'hovercards-root';

ReactDOM.render(
	<Provider store={createStore()}>
		<Hovercards />
	</Provider>,
	element
);
