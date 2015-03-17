'use strict';

define([], function() {
    function video(id, callback) {
        callback();
    }

    function channel(id, callback) {
        callback();
    }

    return { video: video, channel: channel };
});
