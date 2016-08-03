var createAction = require('redux-actions').createAction;

var browser = require('../extension/browser');

var clearEntities = createAction('CLEAR_ENTITIES');

module.exports.authenticate = function(request) {
	return function(dispatch) {
		return browser.runtime.sendMessage({ type: 'authenticate', payload: request })
			.then(function() {
				return dispatch(clearEntities(request.api));
			});
	};
};
