'use strict';

define([], function() {
    return function youtubeVideoBackground() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (request.msg !== 'triggered' || request.content !== 'youtube-video') {
                return;
            }
            chrome.tabs.sendMessage(sender.tab.id, { msg: 'cards', cards: [{ content: 'youtube-video' }] });
        });
    };
});
