var _            = require('underscore');
var createAction = require('redux-actions').createAction;
var promisify    = require('es6-promisify');

var browser            = require('../extension/browser');
var integrations       = require('../integrations');
var integrationsConfig = require('../integrations/config');
var entityLabel        = require('../utils/entity-label');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

var serverEndpoint    = 'http://' + (process.env.NODE_ENV === 'production' ? 'hover.cards' : 'localhost:5000') + '/v2/';
var setAuthentication = createAction('SET_AUTHENTICATION');
var setEntity         = createAction('SET_ENTITY', null, function(entity, label) {
	if (!label) {
		return null;
	}
	return { label: label };
});

module.exports = require('./actions.common');

var loading = {};

module.exports.getEntity = function(request, meta, sender) {
	var start = Date.now();

	return function(dispatch, getState) {
		var label = entityLabel(request);
		var state = getState();

		var entity = state.entities[label];

		if (entity && entity.loaded && Date.now() - entity.loaded <= (integrationsConfig.integrations[request.api].cache_length || 5 * 60 * 1000)) {
			return Promise.resolve({ payload: entity });
		}

		if (!loading[label]) {
			loading[label] = integrations(request);

			loading[label]
				.then(function(entity) {
					dispatch(setEntity(entity));
					var newLabel = entityLabel(entity);
					if (newLabel !== label) {
						dispatch(setEntity(entity, label));
					}
					dispatch(module.exports.analytics(['send', 'timing', 'service', 'loading', Date.now() - start, entityLabel(entity, true)], sender));
				})
				.catch(function(err) {
					err.request = request;
					dispatch(setEntity(err));
					// FIXME #9 Log Error
				});
		}

		if (sender.tab.id !== undefined) {
			loading[label]
				.then(function(entity) {
					browser.tabs.sendMessage(sender.tab.id, { type: 'setEntity', payload: entity });
					var newLabel = entityLabel(entity);
					if (newLabel !== label) {
						browser.tabs.sendMessage(sender.tab.id, { type: 'setEntity', payload: entity, meta: { label: label } });
					}
				})
				.catch(function(err) {
					err.request = request;
					browser.tabs.sendMessage(sender.tab.id, { type: 'setEntity', payload: err, error: true });
				});
		}

		dispatch(setEntity(state.entities[label] || request));
		return Promise.resolve({ payload: state.entities[label] || request });
	};
};

browser.storage.local.get('user_id')
	.then(function(obj) {
		if (!obj.user_id) {
			return;
		}
		browser.storage.local.remove('user_id');
		browser.storage.sync.set(obj);
	});

var getAnalytics;

module.exports.analytics = function(request, meta, sender) {
	return function() {
		getAnalytics = getAnalytics || (
			process.env.GOOGLE_ANALYTICS_ID ?
				new Promise(function(resolve) {
					/* eslint-disable */
					(function(i, s, o, g, r, a, m) {i['GoogleAnalyticsObject'] = r;i[r] = i[r] || function() {
						(i[r].q = i[r].q || []).push(arguments);}, i[r].l = 1 * new Date();a = s.createElement(o),
					m = s.getElementsByTagName(o)[0];a.async = 1;a.src = g;m.parentNode.insertBefore(a, m);
					})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
					/* eslint-enable */

					setTimeout(resolve);
				})
					.then(function() {
						return promisify(global.ga)();
					})
					.then(function() {
						return browser.storage.sync.get({ user_id: _.times(25, _.partial(_.sample, ALPHANUMERIC, null)).join('') }).then(_.property('user_id'));
					})
					.then(function(user_id) {
						global.ga('create', process.env.GOOGLE_ANALYTICS_ID, { userId: user_id });
						global.ga('set', 'checkProtocolTask', _.noop);
						global.ga('set', { appName: browser.i18n.getMessage('app_name'), appVersion: browser.runtime.getManifest().version });

						return global.ga;
					}) :
				Promise.resolve(function() {
					var request = _.toArray(arguments);
					if (_.chain(request).first(2).isEqual(['send', 'exception']).value()) {
						console.error('google analytics', request);
					} else {
						console.debug('google analytics', request);
					}
				})
		);

		var last = _.last(request);
		if (!_.isObject(last) || _.isString(last) || _.isFunction(last)) {
			last = {};
			request.push(last);
		}

		var screenName = _.last(request).screenName || _.chain(sender).result('tab').result('url').value() || _.result(sender, 'url');
		if (screenName) {
			last.screenName = screenName;
		}

		return getAnalytics
			.then(function(ga) {
				ga.apply(this, request);
			})
			.catch(function() {
				// FIXME #9 Log "impossible" err
				// Don't return err
			});
	};
};

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
				dispatch(module.exports.analytics(['send', 'event', 'service', 'authenticated', request.api], sender));
			});
	};
};
