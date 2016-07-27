var createAction = require('redux-actions').createAction;

var browser            = require('../extension/browser');
var integrations       = require('../integrations');
var integrationsConfig = require('../integrations/config');
var entityLabel        = require('../utils/entity-label');

var setEntity = createAction('SET_ENTITY');

module.exports = require('./actions.common');

var loading = {};

module.exports.getEntity = function(request, tabId) {
	return function(dispatch, getState) {
		var label = entityLabel(request);
		var state = getState();

		var entity = state.entities[label];

		if (entity && entity.loaded && Date.now() - entity.loaded <= (integrationsConfig.integrations[request.api].cache_length || 5 * 60 * 1000)) {
			return Promise.resolve(entity);
		}

		loading[label] = loading[label] || integrations(request);

		// FIXME #9
		loading[label].then(function(entity) {
			dispatch(setEntity(entity));
			return browser.tabs.sendMessage(tabId, { type: 'setEntity', payload: entity });
		});

		dispatch(setEntity(state.entities[label] || request));
		return Promise.resolve(state.entities[label] || request);
	};
};
