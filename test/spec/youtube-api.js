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
        it('should make an ajax call', function() {
            $.ajax.returns({ done: $.noop });
            youtubeApi.video('SOME_VIDEO_ID', $.noop);
            $.ajax.should.have.been.calledWith(sinon.match.has('url', 'https://www.googleapis.com/youtube/v3/videos'));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('id', 'SOME_VIDEO_ID')));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('part', 'snippet,statistics')));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('key', youtubeApi.API_KEY)));
        });

        it('should return a youtubeVideoCard', function() {
            $.ajax.returns({
                done: sandbox.stub().yields({ items: [{ snippet:    { publishedAt: '2011-04-06T03:21:59.000Z',
                                                                      channelId:   'SOME_CHANNEL_ID',
                                                                      thumbnails:  { medium: { url: 'medium_url.jpg' } },
                                                                      localized:   { title:       'Some Title',
                                                                                     description: 'Some Description' } },
                                                        statistics: { viewCount:    1000,
                                                                      likeCount:    2000,
                                                                      dislikeCount: 3000 } }] })
            });
            var callback = sandbox.spy();
            youtubeApi.video('SOME_VIDEO_ID', callback);
            callback.should.have.been.calledWith(null);
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('content',     'youtube-video'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('id',          'SOME_VIDEO_ID'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('icon',        'medium_url.jpg'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('title',       'Some Title'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('description', 'Some Description'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('date',        1302060119000));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('views',       1000));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('likes',       2000));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('dislikes',    3000));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('channel',     sinon.match.has('id', 'SOME_CHANNEL_ID')));
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
