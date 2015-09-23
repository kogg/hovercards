var $ = require('jquery');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Cleanup = 'cleanup' + NameSpace;
var Click   = 'click' + NameSpace;

var feedback_url;
var last_interacted_feedback_url;
var show_feedback = false;

$.fn.extend({
    addFeedback: function(obj) {
        if (!show_feedback) {
            return this;
        }
        var feedback_obj = $('<div class="feedback-link"></div>')
            .on(Click, function(e) {
                e.stopPropagation();
                last_interacted_feedback_url = feedback_url;
                chrome.storage.sync.set({ last_interacted_feedback_url: last_interacted_feedback_url });
                show_feedback = false;
                obj.trigger(Cleanup);
            });
        $('<a href="' + feedback_url + '" target="_blank"><img src="' + chrome.extension.getURL('images/logo-128.png') + '"><div>Hey you! Can you give me feedback?</div></a>')
            .on(Click, function() {
                $.analytics('send', 'event', 'went to feedback', 'click', 'hovercard link');
            })
            .appendTo(feedback_obj);
        $('<span></span>')
            .on(Click, function() {
                $.analytics('send', 'event', 'ignored feedback', 'click', 'hovercard link');
            })
            .appendTo(feedback_obj);
        feedback_obj.appendTo(this);
        return this;
    },
    // TODO Get rid of this crap
    feedback_height: function() {
        return this.has('.feedback-link').length ? 38 : 0;
    }
});

chrome.storage.sync.get(['feedback_url', 'last_interacted_feedback_url'], function(obj) {
    chrome.storage.onChanged.addListener(function(changes, area_name) {
        if (area_name !== 'sync' || !('feedback_url' in changes || 'last_interacted_feedback_url' in changes)) {
            return;
        }
        feedback_url = obj.feedback_url;
        last_interacted_feedback_url = obj.last_interacted_feedback_url;
        show_feedback = feedback_url && feedback_url.length && feedback_url !== last_interacted_feedback_url;
    });
    feedback_url = obj.feedback_url;
    last_interacted_feedback_url = obj.last_interacted_feedback_url;
    show_feedback = feedback_url && feedback_url.length && feedback_url !== last_interacted_feedback_url;
});
