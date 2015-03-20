'use strict';

describe('youtube-api', function() {
    var sandbox = sinon.sandbox.create();
    var purl;
    var youtubeApi;

    before(function(done) {
        require(['purl'], function(_purl) {
            purl = _purl;
            done();
        });
    });

    beforeEach(function(done) {
        require(['youtube-api'], function(_youtubeApi) {
            sandbox.useFakeServer();
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
        it('should call youtube\'s API', function() {
            youtubeApi.video('SOME_VIDEO_ID', $.noop);

            var url = purl(sandbox.server.requests[0].url);
            (url.attr('protocol') + '://' + url.attr('host') + url.attr('path')).should.equal('https://www.googleapis.com/youtube/v3/videos');
            url.param('id').should.equal('SOME_VIDEO_ID');
            url.param('part').should.equal('snippet,statistics');
            url.param('key').should.equal(youtubeApi.API_KEY);
        });

        it('should callback a youtubeVideoCard', function() {
            var callback = sandbox.spy();
            youtubeApi.video('SOME_VIDEO_ID', callback);
            sandbox.server.respondWith([200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify({ items: [{ snippet:    { publishedAt: '2011-04-06T03:21:59.000Z',
                                                                                 channelId:   'SOME_CHANNEL_ID',
                                                                                 thumbnails:  { medium: { url: 'image.jpg' } },
                                                                                 localized:   { title:       'Some Title',
                                                                                                description: 'Some Description' } },
                                                                   statistics: { viewCount:    1000,
                                                                                 likeCount:    2000,
                                                                                 dislikeCount: 3000 } }] })]);
            sandbox.server.respond();

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
            var callback = sandbox.spy();
            youtubeApi.video('SOME_VIDEO_ID', callback);
            sandbox.server.respondWith([404, null, '']);
            sandbox.server.respond();

            callback.should.have.been.calledWith(sinon.match.defined);
        });
    });

    describe('.channel', function() {
        it('should call youtube\'s API', function() {
            youtubeApi.channel('SOME_CHANNEL_ID', $.noop);

            var url = purl(sandbox.server.requests[0].url);
            (url.attr('protocol') + '://' + url.attr('host') + url.attr('path')).should.equal('https://www.googleapis.com/youtube/v3/channels');
            url.param('id').should.equal('SOME_CHANNEL_ID');
            url.param('part').should.equal('snippet,statistics');
            url.param('key').should.equal(youtubeApi.API_KEY);
        });

        it('should callback a youtubeChannelCard', function() {
            var callback = sandbox.spy();
            youtubeApi.channel('SOME_CHANNEL_ID', callback);
            sandbox.server.respondWith([200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify({ items: [{ snippet:    { thumbnails: { medium: { url: 'image.jpg' } },
                                                                                 localized:  { title:       'Some Title',
                                                                                               description: 'Some Description' } },
                                                                   statistics: { viewCount:       2000,
                                                                                 subscriberCount: 3000,
                                                                                 videoCount:      1000 } }] })]);
            sandbox.server.respond();

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

        it('should callback an error on failure', function() {
            var callback = sandbox.spy();
            youtubeApi.channel('SOME_CHANNEL_ID', callback);
            sandbox.server.respondWith([404, null, '']);
            sandbox.server.respond();

            callback.should.have.been.calledWith(sinon.match.defined);
        });
    });

    describe('.comments', function() {
        it('should call youtube\'s API (v2)', function() {
            youtubeApi.comments('SOME_VIDEO_ID', $.noop);

            var url = purl(sandbox.server.requests[0].url);
            (url.attr('protocol') + '://' + url.attr('host') + url.attr('path')).should.equal('https://gdata.youtube.com/feeds/api/videos/SOME_VIDEO_ID/comments');
            url.param('max-results').should.equal('5');
        });

        it('should callback an error on failure', function() {
            var callback = sandbox.spy();
            youtubeApi.comments('SOME_VIDEO_ID', callback);
            sandbox.server.respondWith([404, null, '']);
            sandbox.server.respond();

            callback.should.have.been.calledWith(sinon.match.defined);
        });
    });
});
