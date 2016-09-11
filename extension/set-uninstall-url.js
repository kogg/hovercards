var _ = require('underscore');

var browser = require('./browser');
var report  = require('../report');

var ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

browser.storage.onChanged.addListener(function(changes, areaName) {
	if (areaName !== 'sync') {
		return;
	}
	_.pairs(changes).forEach(function(entry) {
		if (entry[0] !== 'user_id') {
			return;
		}
		browser.runtime.setUninstallURL('http://' + (process.env.NODE_ENV === 'production' ? 'hover.cards' : 'localhost:5100') + '/track_uninstall?user_id=' + entry[1].newValue)
			.catch(report.captureException);
	});
});

browser.runtime.setUninstallURL('http://' + (process.env.NODE_ENV === 'production' ? 'hover.cards' : 'localhost:5100') + '/track_uninstall')
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
		return browser.runtime.setUninstallURL('http://' + (process.env.NODE_ENV === 'production' ? 'hover.cards' : 'localhost:5100') + '/track_uninstall?user_id=' + user_id);
	})
	.catch(report.captureException);
