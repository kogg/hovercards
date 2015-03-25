'use strict';

define(['youtube-api'], function(youtubeApi) {
    return function youtubeVideoBackground() {
        var i = 0;
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (request.msg !== 'trigger' || request.content !== 'youtube-video') {
                return;
            }
            var h = i++;
            chrome.tabs.sendMessage(sender.tab.id, { msg: 'cards',
                                                     id:  'youtube-video-' + h });
            youtubeApi.video(request.id, function(err, youtubeVideoCard) {
                youtubeVideoCard.priority = 0;
                chrome.tabs.sendMessage(sender.tab.id, { msg:  'card',
                                                         id:   'youtube-video-' + h,
                                                         card: youtubeVideoCard });
                youtubeApi.channel(youtubeVideoCard.channel.id, function(err, youtubeChannelCard) {
                    youtubeChannelCard.priority = 1;
                    chrome.tabs.sendMessage(sender.tab.id, { msg:  'card',
                                                             id:   'youtube-video-' + h,
                                                             card: youtubeChannelCard });
                });
                youtubeApi.comments(youtubeVideoCard.id, function(err, youtubeCommentsCard) {
                    youtubeCommentsCard.priority = 2;
                    chrome.tabs.sendMessage(sender.tab.id, { msg:  'card',
                                                             id:   'youtube-video-' + h,
                                                             card: youtubeCommentsCard });
                });
            });
        });
    };
});
