var createAction = require('redux-actions').createAction;

var browser = require('../extension/browser');

module.exports.authenticate = function(request) {
	return function() {
		return browser.runtime.sendMessage(createAction('authenticate')(request));
	};
};
