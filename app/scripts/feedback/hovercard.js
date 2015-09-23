var $ = require('jquery');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Cleanup = 'cleanup' + NameSpace;
var Click   = 'click' + NameSpace;

var feedback_url = 'http://saiichihashimoto.com';
var show_feedback = true;

$.fn.extend({
    addFeedback: function(obj) {
        if (!show_feedback) {
            return this;
        }
        $('<div class="feedback-link"></div>')
            .append('<a href="' + feedback_url + '" target="_blank"><img src="' + chrome.extension.getURL('images/logo-128.png') + '"><div>Hey you! Can you give me feedback?</div></a>')
            .append('<span></span>')
            .on('click', function(e) {
                e.stopPropagation();
                obj.trigger(Cleanup);
            })
            .appendTo(this);
        return this;
    },
    // TODO Get rid of this crap
    positionFeedback: function() {
        this.find('.feedback-link').toggleClass('feedback-link-bottom', this.hasClass(EXTENSION_ID + '-hovercard-from-bottom'));
        return this;
    }
});
