'use strict';

define(['jquery'], function($) {
    var youtubeApi = {};

    function video(id, callback) {
        $.ajax({ url:  'https://www.googleapis.com/youtube/v3/videos',
                 data: { id:   id,
                         part: 'snippet,statistics',
                         key:  youtubeApi.API_KEY } })
            .done(function(data) {
                callback(null, { content:     'youtube-video',
                                 id:          id,
                                 icon:        data.items[0].snippet.thumbnails.medium.url,
                                 title:       data.items[0].snippet.localized.title,
                                 description: data.items[0].snippet.localized.description,
                                 date:        Date.parse(data.items[0].snippet.publishedAt),
                                 views:       data.items[0].statistics.viewCount,
                                 likes:       data.items[0].statistics.likeCount,
                                 dislikes:    data.items[0].statistics.dislikeCount,
                                 channel:     { id: data.items[0].snippet.channelId } });
            });
    }

    function channel(id, callback) {
        callback();
    }

    youtubeApi.API_KEY = 'YOUTUBE_API_KEY';
    youtubeApi.video = video;
    youtubeApi.channel = channel;

    return youtubeApi;
});
