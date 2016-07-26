var _            = require('underscore');
var createAction = require('redux-actions').createAction;

var browser      = require('../extension/browser');
var integrations = require('../integrations');
var entityLabel  = require('../utils/entity-label');

var setEntity = createAction('SET_ENTITY');

module.exports = require('./actions.common');

var loading = {};

module.exports.getEntity = function(request, tabId) {
	return function(dispatch, getState) {
		var label = entityLabel(request);
		var state = getState();

		var entity = state.entities[label];

		if (entity && entity.loaded && Date.now() - entity.loaded <= 5 * 60 * 1000) {
			return Promise.resolve(entity);
		}

		loading[label] = loading[label] || new Promise(function(resolve) {
			setTimeout(function() {
				delete loading[label];
				var response = _.defaults({ loaded: Date.now(), key: 'value' }, state.entities[label] || request);
				dispatch(setEntity(response));
				resolve(response);
			}, 5000);
		});
		console.log(integrations[request.api][request.type]);

		// FIXME #9
		loading[label].then(function(entity) {
			browser.tabs.sendMessage(tabId, { type: 'setEntity', payload: entity });
		});

		entity = _.defaults({ loaded: false }, state.entities[label] || request);
		dispatch(setEntity(entity));
		return Promise.resolve(entity);
	};
};
