var $         = require('jquery');
var constants = require('../common/constants');

chrome.storage.sync.get(['feedback_url', 'last_feedback_retrieval'], function(obj) {
	(function retrieve_feedback_url() {
		setTimeout(function() {
			$.ajax({ url: constants.endpoint + '/feedback' })
				.done(function(data) {
					obj.feedback_url = data.feedback_url;
					chrome.storage.sync.set({ feedback_url: obj.feedback_url });
				})
				.always(function() {
					obj.last_feedback_retrieval = Date.now();
					chrome.storage.sync.set({ last_feedback_retrieval: obj.last_feedback_retrieval });
					retrieve_feedback_url();
				});
		}, Math.max(0, (obj.last_feedback_retrieval || 0) + 24 * 60 * 60 * 1000 - Date.now()));
	}());
});
