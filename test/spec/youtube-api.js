'use strict';

describe('youtube-api', function() {
    var youtubeApi;

    beforeEach(function(done) {
        require(['youtube-api'], function(_youtubeApi) {
            youtubeApi = _youtubeApi;
            done();
        });
    });

    it('should have an API_KEY', function() {
        youtubeApi.API_KEY.should.be.a('string');
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
