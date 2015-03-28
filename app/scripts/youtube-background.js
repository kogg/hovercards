'use strict';

define(['jquery', 'purl'], function($, purl) {
    var key = 'AIzaSyCIBp_dCztnCozkp1Yeqxa9F70rcVpFn30';

    return function youtubeBackground() {
        chrome.runtime.onMessage.addListener(function(request, sender, callback) {
            if (request.msg !== 'data') {
                return;
            }
            switch (request.content) {
                case 'youtube-video':
                    $.ajax({ url:  'https://www.googleapis.com/youtube/v3/videos',
                             data: { id:   request.id,
                                     part: 'snippet,statistics',
                                     key:  key } })
                        .done(function(response) {
                            callback({ id:          request.id,
                                       image:       response.items[0].snippet.thumbnails.medium.url,
                                       title:       response.items[0].snippet.localized.title,
                                       description: response.items[0].snippet.localized.description,
                                       date:        Date.parse(response.items[0].snippet.publishedAt),
                                       views:       response.items[0].statistics.viewCount,
                                       likes:       response.items[0].statistics.likeCount,
                                       dislikes:    response.items[0].statistics.dislikeCount,
                                       channelId:   response.items[0].snippet.channelId });
                        });
                    return true;
                case 'youtube-channel':
                    $.ajax({ url:  'https://www.googleapis.com/youtube/v3/channels',
                             data: { id:   request.id,
                                     part: 'snippet,statistics',
                                     key:  key } })
                        .done(function(response) {
                            callback({ id:          request.id,
                                       image:       response.items[0].snippet.thumbnails.medium.url,
                                       title:       response.items[0].snippet.localized.title,
                                       description: response.items[0].snippet.localized.description,
                                       videos:      response.items[0].statistics.videoCount,
                                       views:       response.items[0].statistics.viewCount,
                                       subscribers: response.items[0].statistics.subscriberCount });
                        });
                    return true;
                case 'youtube-comments-v2':
                    $.ajax({ url:  'https://gdata.youtube.com/feeds/api/videos/' + request.id + '/comments',
                             data: { 'max-results': 5 } })
                        .done(function(result) {
                            result = $(result);
                            var entries = result.children('feed').children('entry');
                            var response = { id:       request.id,
                                             count:    parseInt(result.children('feed').children('openSearch\\:totalResults').text()),
                                             comments: [] };
                            for (var i = 0; i < entries.length; i++) {
                                var entry = $(entries[i]);
                                response.comments.push({ name:      entry.children('author').children('name').text(),
                                                         userId:    purl(entry.children('author').children('uri').text()).segment(-1),
                                                         date:      Date.parse(entry.children('published').text()),
                                                         content:   entry.children('content').text(),
                                                         channelId: entry.children('yt\\:channelId').text() });
                            }
                            callback(response);
                        });
                    return true;
                case 'youtube-user-v2':
                    $.ajax({ url: 'https://gdata.youtube.com/feeds/api/users/' + request.id })
                        .done(function(response) {
                            callback({ id:    request.id,
                                       image: $(response).children('entry').children('media\\:thumbnail').attr('url') });
                        });
                    return true;
            }
        });
    };
});
