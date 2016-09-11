var _     = require('underscore');
var Raven = require('raven-js');

var browser = require('../extension/browser');

Raven
	.config(process.env.SENTRY_DSN_CLIENT, {
		environment: process.env.NODE_ENV,
		release:     process.env.npm_package_version
	})
	.install();

browser.storage.onChanged.addListener(function(changes, areaName) {
	if (areaName !== 'sync') {
		return;
	}
	_.pairs(changes).forEach(function(entry) {
		if (entry[0] !== 'user_id') {
			return;
		}
		Raven.setUserContext({ id: entry[1].newValue });
	});
});

browser.storage.sync.get('user_id')
	.then(_.property('user_id'))
	.then(function(user_id) {
		if (!user_id) {
			return;
		}

		Raven.setUserContext({ id: user_id });
	})
	.catch(Raven.captureException);

module.exports = Raven;
