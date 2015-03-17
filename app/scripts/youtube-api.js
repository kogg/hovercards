'use strict';

define([], function() {
    var youtubeApi = {};

    function video(id, callback) {
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
