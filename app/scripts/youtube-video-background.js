'use strict';

define(['async', 'youtube-api'], function(async, youtubeApi) {
    return function youtubeVideoBackground() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (request.msg !== 'triggered' || request.content !== 'youtube-video') {
                return;
            }
            async.auto({
                youtubeVideoCard: [async.apply(youtubeApi.video, request.id)],
                youtubeChannelCard: ['youtubeVideoCard', function(next, results) {
                    if (!results.youtubeVideoCard.channel) {
                        return next();
                    }
                    youtubeApi.channel(results.youtubeVideoCard.channel.id, next);
                }]
            }, function(err, results) {
                if (err) {
                    // TODO Handle this... better
                    return console.log(err);
                }
                var cards = [];
                if (results.youtubeVideoCard)   { cards.push(results.youtubeVideoCard); }
                if (results.youtubeChannelCard) { cards.push(results.youtubeChannelCard); }
                chrome.tabs.sendMessage(sender.tab.id, { msg: 'cards', cards: cards });
            });
        });
    };
});
