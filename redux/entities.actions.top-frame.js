var _            = require('underscore');
var createAction = require('redux-actions').createAction;

var browser     = require('../extension/browser');
var entityLabel = require('../utils/entity-label');

var setEntity = createAction('SET_ENTITY', null, function(entity, label) {
	return label && { label: label };
});

module.exports.getEntity = function(request) {
	return function(dispatch, getState) {
		var state = getState();
		var label = entityLabel(request);
		if (state.entities[label] && state.entities[label].loaded && Date.now() - state.entities[label].loaded <= 5 * 60 * 1000) {
			return Promise.resolve();
		}

		return browser.runtime.sendMessage(createAction('getEntity')(request))
			.then(_.property('payload'))
			.then(setEntity)
			.then(dispatch);
	};
};

module.exports.setEntity = function(request, meta) {
	return function(dispatch) {
		dispatch(setEntity(request, (meta || {}).label));
		return Promise.resolve();
	};
};
