var _            = require('underscore');
var createAction = require('redux-actions').createAction;
var promisify    = require('es6-promisify');

var browser            = require('../extension/browser');
var integrations       = require('../integrations');
var integrationsConfig = require('../integrations/config');
var entityLabel        = require('../utils/entity-label');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

var setEntity = createAction('SET_ENTITY');

module.exports = require('./actions.common');

var loading = {};

module.exports.getEntity = function(request, sender) {
	var start = Date.now();

	return function(dispatch, getState) {
		var label = entityLabel(request);
		var state = getState();

		var entity = state.entities[label];

		if (entity && entity.loaded && Date.now() - entity.loaded <= (integrationsConfig.integrations[request.api].cache_length || 5 * 60 * 1000)) {
			return Promise.resolve(entity);
		}

		loading[label] = loading[label] || integrations(request).then(function(result) {
			dispatch(module.exports.analytics(['send', 'timing', 'service', 'loading', Date.now() - start, entityLabel(request, true)], sender));

			return result;
		});

		// FIXME #9
		if (sender.tab.id !== undefined) {
			loading[label].then(function(entity) {
				dispatch(setEntity(entity));
				return browser.tabs.sendMessage(sender.tab.id, { type: 'setEntity', payload: entity });
			});
		}

		dispatch(setEntity(state.entities[label] || request));
		return Promise.resolve(state.entities[label] || request);
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

var analytics;

module.exports.analytics = function(request, sender) {
	return function() {
		// FIXME #9
		analytics = analytics || (
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

		return analytics.then(function(ga) {
			ga.apply(this, request);
			return request;
		});
	};
};
