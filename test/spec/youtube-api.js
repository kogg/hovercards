'use strict';

describe('youtube-api', function() {
    var youtubeApi;

    beforeEach(function(done) {
        require(['youtube-api'], function(_youtubeApi) {
            youtubeApi = _youtubeApi;
            done();
        });
    });

    describe('.video', function() {
        beforeEach(function(done) {
            youtubeApi.video('SOME_VIDEO_ID', done);
        });

        it('should have a test', function() {
        });
    });

    describe('.channel', function() {
        beforeEach(function(done) {
            youtubeApi.channel('SOME_CHANNEL_ID', done);
        });

        it('should have a test', function() {
        });
    });
});
