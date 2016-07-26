var _            = require('underscore');
var createAction = require('redux-actions').createAction;

var browser      = require('../extension/browser');
var entity_label = require('../utils/entity-label');

var setEntity = createAction('SET_ENTITY');

module.exports = require('./actions.common');

module.exports.getEntity = function(request, tabId) {
	return function(dispatch, getState) {
		var label = entity_label(request);
		var state = getState();

		if (state.entities[label]) {
			return Promise.resolve(state.entities[label]);
		}

		setTimeout(function() {
			// FIXME KEEP WORKING
			var response = _.defaults({ loaded: true, key: 'value' }, request);
			dispatch(setEntity(response));
			browser.tabs.sendMessage(tabId, { type: 'setEntity', payload: response });
		}, 5000);

		request = _.defaults({ loaded: false }, request);
		dispatch(setEntity(request));
		return Promise.resolve(request);
	};
};
