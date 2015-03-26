'use strict';

define(['jquery'], function($) {
    var key = 'AIzaSyCIBp_dCztnCozkp1Yeqxa9F70rcVpFn30';

    return function youtubeBackground() {
        chrome.runtime.onMessage.addListener(function(request, sender, callback) {
            if (request.msg !== 'youtube') {
                return;
            }
            switch (request.content) {
                case 'youtube-video':
                    $.ajax({ url:  'https://www.googleapis.com/youtube/v3/videos',
                             data: { id:   request.id,
                                     part: 'snippet,statistics',
                                     key:  key } })
                        .done(function(data) {
                            callback({ image:       data.items[0].snippet.thumbnails.medium.url,
                                       title:       data.items[0].snippet.localized.title,
                                       description: data.items[0].snippet.localized.description,
                                       date:        Date.parse(data.items[0].snippet.publishedAt),
                                       views:       data.items[0].statistics.viewCount,
                                       likes:       data.items[0].statistics.likeCount,
                                       dislikes:    data.items[0].statistics.dislikeCount,
                                       channelId:   data.items[0].snippet.channelId });
                        });
                    return true;
                case 'youtube-channel':
                    $.ajax({ url:  'https://www.googleapis.com/youtube/v3/channels',
                             data: { id:   request.id,
                                     part: 'snippet,statistics',
                                     key:  key } })
                        .done(function(data) {
                            callback({ image:       data.items[0].snippet.thumbnails.medium.url,
                                       title:       data.items[0].snippet.localized.title,
                                       description: data.items[0].snippet.localized.description,
                                       videos:      data.items[0].statistics.videoCount,
                                       views:       data.items[0].statistics.viewCount,
                                       subscribers: data.items[0].statistics.subscriberCount });
                        });
                    return true;
            }
        });
    };
});
