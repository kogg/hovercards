var $ = require('jquery');

// TODO Put this in a common place
var ENDPOINT = 'https://hovercards.herokuapp.com/v1';
// var ENDPOINT = 'http://localhost:5000/v1';

chrome.storage.sync.get(['feedback_url', 'last_interacted_feedback_url', 'last_feedback_retrieval'], function(obj) {
    (function retrieve_feedback_url() {
        setTimeout(function() {
            $.ajax({ url: ENDPOINT + '/feedback_url' })
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
