'use strict';

describe('youtube-background', function() {
    var sandbox = sinon.sandbox.create();
    var purl;

    before(function(done) {
        require(['purl'], function(_purl) {
            purl = _purl;
            done();
        });
    });

    beforeEach(function(done) {
        require(['youtube-background'], function(youtubeBackground) {
            sandbox.useFakeServer();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            youtubeBackground();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on youtube-video message', function() {
        var REGEX_VIDEO = /^https:\/\/www.googleapis.com\/youtube\/v3\/videos/;

        it('should call youtube\'s API', function() {
            var callback = sandbox.spy();
            chrome.runtime.onMessage.addListener.yield({ msg: 'youtube', content: 'youtube-video', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, callback);

            var url = purl(sandbox.server.requests[0].url);
            (url.attr('protocol') + '://' + url.attr('host') + url.attr('path')).should.equal('https://www.googleapis.com/youtube/v3/videos');
            url.param('id').should.equal('SOME_ID');
            url.param('part').should.equal('snippet,statistics');
            url.param('key').should.not.be.undefined;
            url.param('key').should.not.be.null;
        });

        it('should callback a youtubeVideo', function() {
            var callback = sandbox.spy();
            chrome.runtime.onMessage.addListener.yield({ msg: 'youtube', content: 'youtube-video', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, callback);
            sandbox.server.respondWith(REGEX_VIDEO,
                                       [200,
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

            callback.should.have.been.calledWith({ image:       'image.jpg',
                                                   title:       'Some Title',
                                                   description: 'Some Description',
                                                   date:        1302060119000,
                                                   views:       1000,
                                                   likes:       2000,
                                                   dislikes:    3000,
                                                   channelId:   'SOME_CHANNEL_ID' });
        });
    });
});
