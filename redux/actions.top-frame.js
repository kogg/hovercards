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
			return Promise.resolve();
		}

		return browser.runtime.sendMessage({ type: 'getEntity', payload: request })
			.catch(compose(dispatch, setEntity, _.property('payload'), _.partial(_.defaults, { request: request })))
			.then(compose(dispatch, setEntity, _.property('payload')));
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
		var promise = browser.runtime.sendMessage({ type: 'analytics', payload: request });

		if (!process.env.GOOGLE_ANALYTICS_ID) {
			promise = promise
				.then(function(response) {
					if (_.chain(response).first(2).isEqual(['send', 'exception']).value()) {
						console.error('google analytics', response);
					} else {
						console.debug('google analytics', response);
					}
				});
		}
		return promise
			.catch(function() {
				// FIXME #9 Log "impossible" err
				// Don't return err
			});
	};
};

module.exports.authenticate = function(request) {
	return function() {
		return browser.runtime.sendMessage({ type: 'authenticate', payload: request });
	};
};
