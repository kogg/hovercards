'use strict';

define(['youtube-api'], function(youtubeApi) {
    return function youtubeVideoBackground() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (request.msg !== 'triggered' || request.content !== 'youtube-video') {
                return;
            }
            youtubeApi.video(request.id, function(err, youtubeVideoCard) {
                if (err) {
                    return console.log(err);
                }
                youtubeApi.channel(youtubeVideoCard.channel.id, function(err, youtubeChannelCard) {
                    if (err) {
                        return console.log(err);
                    }
                    delete youtubeVideoCard.channel;
                    chrome.tabs.sendMessage(sender.tab.id, { msg: 'cards', cards: [youtubeVideoCard, youtubeChannelCard] });
                });
            });
        });
    };
});
