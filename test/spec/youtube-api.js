'use strict';

describe('youtube-api', function() {
    var sandbox = sinon.sandbox.create();
    var ajaxReturnValue;
    var youtubeApi;

    beforeEach(function(done) {
        require(['youtube-api'], function(_youtubeApi) {
            sandbox.stub($, 'ajax');
            youtubeApi = _youtubeApi;
            done();
        });
    });

    beforeEach(function() {
        ajaxReturnValue = {};
        ajaxReturnValue.done = sandbox.stub().returns(ajaxReturnValue);
        ajaxReturnValue.fail = sandbox.stub().returns(ajaxReturnValue);
        $.ajax.returns(ajaxReturnValue);
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should have an API_KEY', function() {
        youtubeApi.API_KEY.should.be.a('string');
    });

    describe('.video', function() {
        it('should make an ajax call', function() {
            youtubeApi.video('SOME_VIDEO_ID', $.noop);
            $.ajax.should.have.been.calledWith(sinon.match.has('url', 'https://www.googleapis.com/youtube/v3/videos'));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('id', 'SOME_VIDEO_ID')));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('part', 'snippet,statistics')));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('key', youtubeApi.API_KEY)));
        });

        it('should callback a youtubeVideoCard', function() {
            ajaxReturnValue.done.yields({ items: [{ snippet:    { publishedAt: '2011-04-06T03:21:59.000Z',
                                                                  channelId:   'SOME_CHANNEL_ID',
                                                                  thumbnails:  { medium: { url: 'image.jpg' } },
                                                                  localized:   { title:       'Some Title',
                                                                                 description: 'Some Description' } },
                                                    statistics: { viewCount:    1000,
                                                                  likeCount:    2000,
                                                                  dislikeCount: 3000 } }] });
            var callback = sandbox.spy();
            youtubeApi.video('SOME_VIDEO_ID', callback);
            callback.should.have.been.calledWith(null);
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('content',     'youtube-video'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('id',          'SOME_VIDEO_ID'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('image',       'image.jpg'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('title',       'Some Title'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('description', 'Some Description'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('date',        1302060119000));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('views',       1000));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('likes',       2000));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('dislikes',    3000));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('channel',     sinon.match.has('id', 'SOME_CHANNEL_ID')));
        });

        it('should callback an error on failure', function() {
            ajaxReturnValue.fail.yields('jqXHR', 'textStatus', 'err');
            var callback = sandbox.spy();
            youtubeApi.video('SOME_VIDEO_ID', callback);
            callback.should.have.been.calledWith('err');
        });
    });

    describe('.channel', function() {
        it('should make an ajax call', function() {
            youtubeApi.channel('SOME_CHANNEL_ID', $.noop);
            $.ajax.should.have.been.calledWith(sinon.match.has('url', 'https://www.googleapis.com/youtube/v3/channels'));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('id', 'SOME_CHANNEL_ID')));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('part', 'snippet,statistics')));
            $.ajax.should.have.been.calledWith(sinon.match.has('data', sinon.match.has('key', youtubeApi.API_KEY)));
        });

        it('should callback a youtubeChannelCard', function() {
            ajaxReturnValue.done.yields({ items: [{ snippet:    { thumbnails: { default: { url: 'image.jpg' } },
                                                                  localized:  { title:       'Some Title',
                                                                                description: 'Some Description' } },
                                                    statistics: { viewCount:       2000,
                                                                  subscriberCount: 3000,
                                                                  videoCount:      1000 } }] });
            var callback = sandbox.spy();
            youtubeApi.channel('SOME_CHANNEL_ID', callback);
            callback.should.have.been.calledWith(null);
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('content',     'youtube-channel'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('id',          'SOME_CHANNEL_ID'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('image',       'image.jpg'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('title',       'Some Title'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('description', 'Some Description'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('videos',       1000));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('views',        2000));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('subscribers',  3000));
        });
    });
});
