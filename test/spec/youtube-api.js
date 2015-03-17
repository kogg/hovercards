'use strict';

describe('youtube-api', function() {
    var sandbox = sinon.sandbox.create();
    var youtubeApi;

    beforeEach(function(done) {
        require(['youtube-api'], function(_youtubeApi) {
            sandbox.stub($, 'ajax');
            youtubeApi = _youtubeApi;
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should have an API_KEY', function() {
        youtubeApi.API_KEY.should.be.a('string');
    });

    describe('.video', function() {
        beforeEach(function(done) {
            youtubeApi.video('SOME_VIDEO_ID', done);
        });

        it('should make an ajax call', function() {
            $.ajax.should.have.been.calledWith(sinon.match.has('url', 'https://www.googleapis.com/youtube/v3/videos'));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('id', 'SOME_VIDEO_ID')));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('part', 'snippet,statistics')));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('key', youtubeApi.API_KEY)));
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
