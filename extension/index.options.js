var Provider = require('react-redux').Provider;
var React    = require('react');
var ReactDOM = require('react-dom');

var Options     = require('../components/Options/Options');
var createStore = require('../redux/createStore');

var store = createStore();

ReactDOM.render(
	<Provider store={store}>
		<Options />
	</Provider>,
	global.document.getElementById('mount')
);
