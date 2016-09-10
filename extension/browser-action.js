var _       = require('underscore');
var browser = require('./browser');
var report  = require('../report');

var url = 'http://hovercards.com';

browser.browserAction.setBadgeBackgroundColor({ color: '#ff0000' });
browser.browserAction.onClicked.addListener(function() {
	browser.tabs.create({ url: url });
	browser.storage.sync.set({ 'notifications.opensource': true })
		.catch(report.captureException);
});

browser.storage.onChanged.addListener(function(changes, areaName) {
	if (areaName !== 'sync') {
		return;
	}
	_.pairs(changes).forEach(function(entry) {
		if (entry[0] !== 'notifications.opensource') {
			return;
		}
		if (entry[1].newValue) {
			url = 'http://hovercards.com';
			browser.browserAction.setBadgeText({ text: '' });
			browser.browserAction.setTitle({ title: 'HoverCards' });
		} else {
			url = 'https://github.com/kogg/hovercards#readme';
			browser.browserAction.setBadgeText({ text: '1' });
			browser.browserAction.setTitle({ title: 'HoverCards is open source!' });
		}
	});
});

browser.storage.sync.get('notifications.opensource')
	.then(function(items) {
		if (items['notifications.opensource']) {
			url = 'http://hovercards.com';
			browser.browserAction.setBadgeText({ text: '' });
			browser.browserAction.setTitle({ title: 'HoverCards' });
		} else {
			url = 'https://github.com/kogg/hovercards#readme';
			browser.browserAction.setBadgeText({ text: '1' });
			browser.browserAction.setTitle({ title: 'HoverCards is open source!' });
		}
	})
	.catch(report.captureException);
