var Provider = require('react-redux').Provider;
var React    = require('react');
var ReactDOM = require('react-dom');

var createStore = require('../redux/createStore');
var Options     = require('../components/Options/Options');

var store = createStore();

ReactDOM.render(
	<Provider store={store}>
		<Options />
	</Provider>,
	global.document.getElementById('mount')
);
