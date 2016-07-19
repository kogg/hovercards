var $      = require('jquery');
var _      = require('underscore');
var async  = require('async');
var config = require('../config');

var WHENTOSTART  = 3;
var numberOfGets = 0;

$.ajax({
	url:      config.endpoint + '/in-app-messaging',
	dataType: 'json',
	jsonp:    false
})
	.done(function(messages) {
		chrome.storage.sync.get('messages_done', function(messages_done) {
			if (!messages_done) {
				return;
			}
			messages = _.reject(messages, function(message) {
				return _.contains(messages_done, message.id);
			});
		});
		chrome.runtime.onMessage.addListener(function(message, sender, callback) {
			if (_.result(message, 'type') !== 'messaging') {
				return false;
			}
			switch (message.action) {
				case 'get':
					numberOfGets++;
					if (numberOfGets < WHENTOSTART) {
						callback();
						return true;
					}
					var inAppMessage = _.sample(messages);
					if (!inAppMessage) {
						callback();
						return true;
					}
					async.waterfall([
						function(callback) {
							chrome.storage.sync.get('messages_counts', function(obj) {
								callback(chrome.runtime.lastError, (obj || {}).messages_counts || {});
							});
						},
						function(messages_counts, callback) {
							messages_counts[inAppMessage.id] = (messages_counts[inAppMessage.id] || 0) + 1;
							chrome.storage.sync.set({ messages_counts: messages_counts }, function(thing) {
								callback(chrome.runtime.lastError, messages_counts[inAppMessage.id]);
							});
						}
					], function(err, message_count) {
						if (err) {
							return callback();
						}
						callback(_.defaults({ count: message_count }, inAppMessage));
					});
					return true;
			}
			return false;
		});
	});
