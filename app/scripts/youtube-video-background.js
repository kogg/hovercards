'use strict';

define(['youtube-api'], function(youtubeApi) {
    return function youtubeVideoBackground() {
        var i = 0;
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (request.msg !== 'triggered' || request.content !== 'youtube-video') {
                return;
            }
            var h = i++;
            youtubeApi.video(request.id, function(err, youtubeVideoCard) {
                chrome.tabs.sendMessage(sender.tab.id, { msg:      'card',
                                                         id:       'youtube-video-' + h,
                                                         priority: 0,
                                                         card:     youtubeVideoCard });
                youtubeApi.channel(youtubeVideoCard.channel.id, function(err, youtubeChannelCard) {
                    chrome.tabs.sendMessage(sender.tab.id, { msg:      'card',
                                                             id:       'youtube-video-' + h,
                                                             priority: 1,
                                                             card:     youtubeChannelCard });
                });
            });
        });
    };
});
