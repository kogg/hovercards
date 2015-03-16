'use strict';

define([], function() {
    return function youtubeVideoBackground() {
        chrome.runtime.onMessage.addListener(function(request, sender, callback) {
            if (request.msg !== 'triggered' || request.content !== 'youtube-video') {
                return;
            }
            var cards = [];
            if (callback) {
                callback(cards);
                return true;
            } else {
                chrome.tabs.sendMessage(sender.tab.id, { msg: 'cards', cards: cards });
            }
        });
    };
});
