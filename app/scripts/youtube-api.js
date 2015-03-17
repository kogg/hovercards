'use strict';

define(['jquery'], function($) {
    var youtubeApi = {};

    function video(id, callback) {
        $.ajax({
            url: 'https://www.googleapis.com/youtube/v3/videos',
            data: {
                id: id,
                part: 'snippet,statistics',
                key: youtubeApi.API_KEY
            }
        });
        callback();
    }

    function channel(id, callback) {
        callback();
    }

    youtubeApi.API_KEY = 'YOUTUBE_API_KEY';
    youtubeApi.video = video;
    youtubeApi.channel = channel;

    return youtubeApi;
});
