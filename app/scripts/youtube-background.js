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
                case 'youtube-comments':
                    $.ajax({ url:  'https://gdata.youtube.com/feeds/api/videos/' + request.id + '/comments',
                             data: { 'max-results': 5 } })
                        .done(function(commentsXML) {
                            var comments = $(commentsXML);
                            var entries = $(comments.children('feed').children('entry'));
                            var ajaxes = entries
                                .children('author')
                                .children('uri')
                                .map(function() {
                                    return $.ajax({ url: $(this).text() });
                                });
                            $.when(ajaxes[0], ajaxes[1], ajaxes[2], ajaxes[3], ajaxes[4])
                                .done(function() {
                                    var response = { comments: [] };
                                    for (var i = 0; i < entries.length; i++) {
                                        var entry = $(entries[i]);
                                        var user = $(arguments[i][0]);
                                        response.comments.push({ name:      entry.children('author').children('name').text(),
                                                                 image:     user.children('entry').children('media\\:thumbnail').attr('url'),
                                                                 date:      Date.parse(entry.children('published').text()),
                                                                 content:   entry.children('content').text(),
                                                                 channelId: entry.children('yt\\:channelId').text() });
                                    }
                                    console.log('sup');
                                    callback(response);
                                });
                        });
                    return true;
            }
        });
    };
});
