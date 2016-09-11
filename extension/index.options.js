require('../report');
require('string.prototype.endswith');
var Provider = require('react-redux').Provider;
var React    = require('react');
var ReactDOM = require('react-dom');

var Options     = require('../components/Options/Options');
var createStore = require('../redux/createStore.options');

global.document.getElementById('mount').className = 'hovercards-root';

ReactDOM.render(
	<Provider store={createStore()}>
		<Options />
	</Provider>,
	global.document.getElementById('mount')
);
