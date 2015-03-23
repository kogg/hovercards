'use strict';

describe('youtube-api', function() {
    var sandbox = sinon.sandbox.create();
    var purl;
    var youtubeApi;
    var callback;

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
        beforeEach(function() {
            youtubeApi.video('SOME_VIDEO_ID', callback = sandbox.spy());
        });

        it('should call youtube\'s API', function() {
            var url = purl(sandbox.server.requests[0].url);
            (url.attr('protocol') + '://' + url.attr('host') + url.attr('path')).should.equal('https://www.googleapis.com/youtube/v3/videos');
            url.param('id').should.equal('SOME_VIDEO_ID');
            url.param('part').should.equal('snippet,statistics');
            url.param('key').should.equal(youtubeApi.API_KEY);
        });

        it('should callback a youtubeVideoCard', function() {
            respondToVideo();
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
            sandbox.server.respond();

            callback.should.have.been.calledWith(sinon.match.defined);
        });

        function respondToVideo() {
            sandbox.server.respondWith(/^https:\/\/www.googleapis.com\/youtube\/v3\/videos/,
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
        }
    });

    describe('.channel', function() {
        beforeEach(function() {
            youtubeApi.channel('SOME_CHANNEL_ID', callback = sandbox.spy());
        });

        it('should call youtube\'s API', function() {
            var url = purl(sandbox.server.requests[0].url);
            (url.attr('protocol') + '://' + url.attr('host') + url.attr('path')).should.equal('https://www.googleapis.com/youtube/v3/channels');
            url.param('id').should.equal('SOME_CHANNEL_ID');
            url.param('part').should.equal('snippet,statistics');
            url.param('key').should.equal(youtubeApi.API_KEY);
        });

        it('should callback a youtubeChannelCard', function() {
            respondToChannel();
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
            sandbox.server.respond();

            callback.should.have.been.calledWith(sinon.match.defined);
        });

        function respondToChannel() {
            sandbox.server.respondWith(/^https:\/\/www.googleapis.com\/youtube\/v3\/channels/,
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify({ items: [{ snippet:    { thumbnails: { medium: { url: 'image.jpg' } },
                                                                                 localized:  { title:       'Some Title',
                                                                                               description: 'Some Description' } },
                                                                   statistics: { viewCount:       2000,
                                                                                 subscriberCount: 3000,
                                                                                 videoCount:      1000 } }] })]);
        }
    });

    describe('.comments', function() {
        beforeEach(function() {
            youtubeApi.comments('SOME_VIDEO_ID', callback = sandbox.spy());
        });

        it('should call youtube\'s API (v2)', function() {
            var url = purl(sandbox.server.requests[0].url);
            (url.attr('protocol') + '://' + url.attr('host') + url.attr('path')).should.equal('https://gdata.youtube.com/feeds/api/videos/SOME_VIDEO_ID/comments');
            url.param('max-results').should.equal('5');
        });

        it('should call youtube\'s API (v2) for each user', function() {
            respondToComments();
            sandbox.server.respond();

            // sandbox.server.requests.length.should.equal(6);
            sandbox.server.requests[1].url.should.equal('URL_1');
            sandbox.server.requests[2].url.should.equal('URL_2');
            sandbox.server.requests[3].url.should.equal('URL_3');
            sandbox.server.requests[4].url.should.equal('URL_4');
            sandbox.server.requests[5].url.should.equal('URL_5');
        });

        it('should callback an error on failure', function() {
            sandbox.server.respond();

            callback.should.have.been.calledWith(sinon.match.defined);
        });

        function respondToComments() {
            /*jshint multistr: true */
            sandbox.server.respondWith(/^https:\/\/gdata.youtube.com\/feeds\/api\/videos\/SOME_VIDEO_ID\/comments/,
                                       [200,
                                        { 'Content-Type': 'application/xml' },
                                        '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:openSearch="http://a9.com/-/spec/opensearchrss/1.0/" xmlns:yt="http://gdata.youtube.com/schemas/2007">\
                                            <entry>\
                                                <published>2015-03-21T23:23:01.000Z</published>\
                                                <content type="text">CONTENT_1</content>\
                                                <author>\
                                                    <name>AUTHOR_NAME_1</name>\
                                                    <uri>URL_1</uri>\
                                                </author>\
                                                <yt:channelId>CHANNEL_ID_1</yt:channelId>\
                                            </entry>\
                                            <entry>\
                                                <published>2015-03-21T23:23:01.000Z</published>\
                                                <content type="text">CONTENT_2</content>\
                                                <author>\
                                                    <name>AUTHOR_NAME_2</name>\
                                                    <uri>URL_2</uri>\
                                                </author>\
                                                <yt:channelId>CHANNEL_ID_2</yt:channelId>\
                                            </entry>\
                                            <entry>\
                                                <published>2015-03-21T23:23:01.000Z</published>\
                                                <content type="text">CONTENT_3</content>\
                                                <author>\
                                                    <name>AUTHOR_NAME_3</name>\
                                                    <uri>URL_3</uri>\
                                                </author>\
                                                <yt:channelId>CHANNEL_ID_3</yt:channelId>\
                                            </entry>\
                                            <entry>\
                                                <published>2015-03-21T23:23:01.000Z</published>\
                                                <content type="text">CONTENT_4</content>\
                                                <author>\
                                                    <name>AUTHOR_NAME_4</name>\
                                                    <uri>URL_4</uri>\
                                                </author>\
                                                <yt:channelId>CHANNEL_ID_4</yt:channelId>\
                                            </entry>\
                                            <entry>\
                                                <published>2015-03-21T23:23:01.000Z</published>\
                                                <content type="text">CONTENT_5</content>\
                                                <author>\
                                                    <name>AUTHOR_NAME_5</name>\
                                                    <uri>URL_5</uri>\
                                                </author>\
                                                <yt:channelId>CHANNEL_ID_5</yt:channelId>\
                                            </entry>\
                                        </feed>']);
        }
    });
});
