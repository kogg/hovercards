var _            = require('underscore');
var createAction = require('redux-actions').createAction;

var analyticsActions   = require('./analytics.actions.background');
var browser            = require('../extension/browser');
var integrationsConfig = require('../integrations/config');

var clearEntities     = createAction('CLEAR_ENTITIES');
var serverEndpoint    = 'http://' + (process.env.NODE_ENV === 'production' ? 'hover.cards' : 'localhost:5000') + '/v2/';
var setAuthentication = createAction('SET_AUTHENTICATION');

module.exports.authenticate = function(request, meta, sender) {
	return function(dispatch) {
		if (!request.api) {
			return Promise.reject({ payload: { message: 'Missing \'api\'', status: 400 }, error: true });
		}
		var integrationConfig = integrationsConfig.integrations[request.api];
		if (!_.result(integrationConfig, 'authenticatable')) {
			return Promise.reject({ payload: { message: request.api + ' cannot be authenticated', status: 400 }, error: true });
		}
		return browser.identity.launchWebAuthFlow({
			url:         _.result(integrationConfig, 'authentication_url', serverEndpoint + '/' + request.api + '/authenticate?chromium_id=EXTENSION_ID').replace('EXTENSION_ID', browser.i18n.getMessage('@@extension_id')),
			interactive: true
		})
			.catch(function(err) {
				err.status = 401;
				return Promise.reject({ payload: err, error: true });
			})
			.then(function(redirectURL) {
				var user = redirectURL && (redirectURL.split('#', 2)[1] || '').split('=', 2)[1];
				if (_.isEmpty(user)) {
					return Promise.reject({ payload: { message: 'No user token returned for ' + request.api + ': ' + redirectURL, status: 500 }, error: true });
				}
				dispatch(setAuthentication({ api: request.api, value: user }));
				dispatch(analyticsActions.analytics(['send', 'event', request.api, 'Authenticated'], sender));
				return dispatch(clearEntities(request.api));
			});
	};
};
