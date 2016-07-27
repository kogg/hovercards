var _            = require('underscore');
var compose      = require('redux').compose;
var createAction = require('redux-actions').createAction;

var browser     = require('../extension/browser');
var entityLabel = require('../utils/entity-label');

var setEntity = createAction('SET_ENTITY');

module.exports = require('./actions.common');

module.exports.getEntity = function(request) {
	return function(dispatch, getState) {
		var state = getState();
		var label = entityLabel(request);
		if (state.entities[label] && state.entities[label].loaded && Date.now() - state.entities[label].loaded <= 5 * 60 * 1000) {
			return Promise.resolve(state.entities[label]);
		}

		return browser.runtime.sendMessage({ type: 'getEntity', payload: request })
			.then(compose(dispatch, setEntity));
	};
};

module.exports.setEntity = function(request) {
	return function(dispatch) {
		dispatch(setEntity(request));
		return Promise.resolve();
	};
};

module.exports.analytics = function(request) {
	return function() {
		return browser.runtime.sendMessage({ type: 'analytics', payload: request })
			.then(function(response) {
				if (process.env.GOOGLE_ANALYTICS_ID) {
					return;
				}
				if (_.chain(response).first(2).isEqual(['send', 'exception']).value()) {
					console.error('google analytics', response);
				} else {
					console.debug('google analytics', response);
				}
			});
	};
};

module.exports.authenticate = function(request) {
	return function() {
		return browser.runtime.sendMessage({ type: 'authenticate', payload: request });
	};
};
