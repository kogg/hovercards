var _            = require('underscore');
var createAction = require('redux-actions').createAction;
var errors       = require('feathers-errors');

var analyticsActions   = require('./analytics.actions');
var browser            = require('../extension/browser');
var integrationsConfig = require('../integrations/config');

var serverEndpoint = 'http://' + (process.env.NODE_ENV === 'production' ? 'hover.cards' : 'localhost:5100') + '/v2/';

module.exports.authenticate = function(request, meta, sender) {
	return function(dispatch) {
		if (!request.api) {
			throw new errors.BadRequest('Missing \'api\'');
		}
		var integrationConfig = integrationsConfig.integrations[request.api];
		if (!_.result(integrationConfig, 'authenticatable')) {
			throw new errors.BadRequest(request.api + ' cannot be authenticated');
		}
		return browser.identity.launchWebAuthFlow({
			url:         _.result(integrationConfig, 'authentication_url', serverEndpoint + '/' + request.api + '/authenticate?chromium_id=EXTENSION_ID').replace('EXTENSION_ID', browser.i18n.getMessage('@@extension_id')),
			interactive: true
		})
			.then(function(redirectURL) {
				var user = redirectURL && (redirectURL.split('#', 2)[1] || '').split('=', 2)[1];
				if (_.isEmpty(user)) {
					throw new errors.GeneralError('No user token returned for ' + request.api + ': ' + redirectURL);
				}
				dispatch(createAction('SET_AUTHENTICATION')({ api: request.api, value: user }));
				dispatch(analyticsActions.analytics(['send', 'event', request.api, 'Authenticated'], sender));
				dispatch(createAction('CLEAR_ENTITIES')(request.api));
			});
	};
};
