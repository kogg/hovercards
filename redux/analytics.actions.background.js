var _            = require('underscore');
var promisify    = require('es6-promisify');

var browser = require('../extension/browser');
var report  = require('../report');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

browser.storage.local.get('user_id')
	.then(_.property('user_id'))
	.then(function(user_id) {
		if (!user_id) {
			return;
		}

		return Promise.all([
			browser.storage.local.remove('user_id'),
			browser.storage.sync.set({ user_id: user_id })
		]);
	})
	.catch(report.captureException);

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
						return browser.storage.sync.get('user_id');
					})
					.then(_.property('user_id'))
					.then(function(user_id) {
						if (user_id) {
							return user_id;
						}

						user_id = _.times(25, _.partial(_.sample, ALPHANUMERIC, null)).join('');
						return browser.storage.sync.set({ user_id: user_id }).then(_.constant(user_id));
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
			});
	};
};
