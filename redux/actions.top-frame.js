var compose      = require('redux').compose;
var createAction = require('redux-actions').createAction;

var browser      = require('../extension/browser');
var entity_label = require('../utils/entity-label');

var setEntity = createAction('SET_ENTITY');

module.exports = require('./actions.common');

module.exports.setEntity = function(request) {
	return function(dispatch) {
		dispatch(setEntity(request));
		return Promise.resolve();
	};
};

module.exports.getEntity = function(request) {
	return function(dispatch, getState) {
		var state = getState();
		var label = entity_label(request);
		if (state.entities[label]) {
			return Promise.resolve(state.entities[label]);
		}

		return browser.runtime.sendMessage({ type: 'getEntity', payload: request })
			.then(compose(dispatch, setEntity));
	};
};
