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
        var REGEX_VIDEO = /^https:\/\/www.googleapis.com\/youtube\/v3\/videos/;

        beforeEach(function() {
            youtubeApi.video('SOME_VIDEO_ID', callback = sandbox.spy());

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
        });

        it('should call youtube\'s API', function() {
            var url = purl(sandbox.server.requests[0].url);
            (url.attr('protocol') + '://' + url.attr('host') + url.attr('path')).should.equal('https://www.googleapis.com/youtube/v3/videos');
            url.param('id').should.equal('SOME_VIDEO_ID');
            url.param('part').should.equal('snippet,statistics');
            url.param('key').should.equal(youtubeApi.API_KEY);
        });

        it('should callback a youtubeVideoCard', function() {
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
            sandbox.server.respondWith(REGEX_VIDEO, [404, {}, '']);
            sandbox.server.respond();

            callback.should.have.been.calledWith(sinon.match.defined);
        });
    });

    describe('.channel', function() {
        var REGEX_CHANNEL = /^https:\/\/www.googleapis.com\/youtube\/v3\/channels/;

        beforeEach(function() {
            youtubeApi.channel('SOME_CHANNEL_ID', callback = sandbox.spy());

            sandbox.server.respondWith(REGEX_CHANNEL,
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify({ items: [{ snippet:    { thumbnails: { medium: { url: 'image.jpg' } },
                                                                                 localized:  { title:       'Some Title',
                                                                                               description: 'Some Description' } },
                                                                   statistics: { viewCount:       2000,
                                                                                 subscriberCount: 3000,
                                                                                 videoCount:      1000 } }] })]);
        });

        it('should call youtube\'s API', function() {
            var url = purl(sandbox.server.requests[0].url);
            (url.attr('protocol') + '://' + url.attr('host') + url.attr('path')).should.equal('https://www.googleapis.com/youtube/v3/channels');
            url.param('id').should.equal('SOME_CHANNEL_ID');
            url.param('part').should.equal('snippet,statistics');
            url.param('key').should.equal(youtubeApi.API_KEY);
        });

        it('should callback a youtubeChannelCard', function() {
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
            sandbox.server.respondWith(REGEX_CHANNEL, [404, {}, '']);
            sandbox.server.respond();

            callback.should.have.been.calledWith(sinon.match.defined);
        });
    });

    describe('.comments', function() {
        var REGEX_COMMENTS = /^https:\/\/gdata.youtube.com\/feeds\/api\/videos\/SOME_VIDEO_ID\/comments/;

        beforeEach(function() {
            youtubeApi.comments('SOME_VIDEO_ID', callback = sandbox.spy());

            /*jshint multistr: true */
            sandbox.server.respondWith(REGEX_COMMENTS,
                                       [200,
                                        { 'Content-Type': 'application/xml' },
                                        '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:openSearch="http://a9.com/-/spec/opensearchrss/1.0/" xmlns:yt="http://gdata.youtube.com/schemas/2007">\
                                            <entry>\
                                                <published>2015-03-21T23:23:01.000Z</published>\
                                                <content type="text">Some Content 1</content>\
                                                <author>\
                                                    <name>Author Name 1</name>\
                                                    <uri>URL_1</uri>\
                                                </author>\
                                                <yt:channelId>SOME_CHANNEL_ID_1</yt:channelId>\
                                            </entry>\
                                            <entry>\
                                                <published>2015-03-22T23:23:01.000Z</published>\
                                                <content type="text">Some Content 2</content>\
                                                <author>\
                                                    <name>Author Name 2</name>\
                                                    <uri>URL_2</uri>\
                                                </author>\
                                                <yt:channelId>SOME_CHANNEL_ID_2</yt:channelId>\
                                            </entry>\
                                            <entry>\
                                                <published>2015-03-23T23:23:01.000Z</published>\
                                                <content type="text">Some Content 3</content>\
                                                <author>\
                                                    <name>Author Name 3</name>\
                                                    <uri>URL_3</uri>\
                                                </author>\
                                                <yt:channelId>SOME_CHANNEL_ID_3</yt:channelId>\
                                            </entry>\
                                            <entry>\
                                                <published>2015-03-24T23:23:01.000Z</published>\
                                                <content type="text">Some Content 4</content>\
                                                <author>\
                                                    <name>Author Name 4</name>\
                                                    <uri>URL_4</uri>\
                                                </author>\
                                                <yt:channelId>SOME_CHANNEL_ID_4</yt:channelId>\
                                            </entry>\
                                            <entry>\
                                                <published>2015-03-25T23:23:01.000Z</published>\
                                                <content type="text">Some Content 5</content>\
                                                <author>\
                                                    <name>Author Name 5</name>\
                                                    <uri>URL_5</uri>\
                                                </author>\
                                                <yt:channelId>SOME_CHANNEL_ID_5</yt:channelId>\
                                            </entry>\
                                        </feed>']);
            sandbox.server.respondWith(/^URL_1$/,
                                       [200,
                                        { 'Content-Type': 'application/xml' },
                                        '<?xml version="1.0" encoding="UTF-8"?>\
                                        <entry xmlns="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://gdata.youtube.com/schemas/2007">\
                                            <media:thumbnail url="image1.jpg" />\
                                        </entry>']);
            sandbox.server.respondWith(/^URL_2$/,
                                       [200,
                                        { 'Content-Type': 'application/xml' },
                                        '<?xml version="1.0" encoding="UTF-8"?>\
                                        <entry xmlns="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://gdata.youtube.com/schemas/2007">\
                                            <media:thumbnail url="image2.jpg" />\
                                        </entry>']);
            sandbox.server.respondWith(/^URL_3$/,
                                       [200,
                                        { 'Content-Type': 'application/xml' },
                                        '<?xml version="1.0" encoding="UTF-8"?>\
                                        <entry xmlns="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://gdata.youtube.com/schemas/2007">\
                                            <media:thumbnail url="image3.jpg" />\
                                        </entry>']);
            sandbox.server.respondWith(/^URL_4$/,
                                       [200,
                                        { 'Content-Type': 'application/xml' },
                                        '<?xml version="1.0" encoding="UTF-8"?>\
                                        <entry xmlns="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://gdata.youtube.com/schemas/2007">\
                                            <media:thumbnail url="image4.jpg" />\
                                        </entry>']);
            sandbox.server.respondWith(/^URL_5$/,
                                       [200,
                                        { 'Content-Type': 'application/xml' },
                                        '<?xml version="1.0" encoding="UTF-8"?>\
                                        <entry xmlns="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://gdata.youtube.com/schemas/2007">\
                                            <media:thumbnail url="image5.jpg" />\
                                        </entry>']);
        });

        it('should call youtube\'s API (v2)', function() {
            var url = purl(sandbox.server.requests[0].url);
            (url.attr('protocol') + '://' + url.attr('host') + url.attr('path')).should.equal('https://gdata.youtube.com/feeds/api/videos/SOME_VIDEO_ID/comments');
            url.param('max-results').should.equal('5');
        });

        it('should call youtube\'s API (v2) for each user', function() {
            sandbox.server.respond();

            sandbox.server.requests.length.should.equal(6);
            sandbox.server.requests[1].url.should.equal('URL_1');
            sandbox.server.requests[2].url.should.equal('URL_2');
            sandbox.server.requests[3].url.should.equal('URL_3');
            sandbox.server.requests[4].url.should.equal('URL_4');
            sandbox.server.requests[5].url.should.equal('URL_5');
        });

        it('should callback a youtubeCommentsCard', function() {
            sandbox.server.respond();
            sandbox.server.respond();

            callback.should.have.been.calledWith(null);
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('content',  'youtube-comments'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('id',       'SOME_VIDEO_ID'));
            callback.should.have.been.calledWith(sinon.match.any, sinon.match.has('comments', sinon.match.array));

            callback.getCall(0).args[1].comments[0].author.name.should.equal('Author Name 1');
            callback.getCall(0).args[1].comments[0].author.image.should.equal('image1.jpg');
            callback.getCall(0).args[1].comments[0].date.should.equal(1426980181000);
            callback.getCall(0).args[1].comments[0].content.should.equal('Some Content 1');
            callback.getCall(0).args[1].comments[0].channel.id.should.equal('SOME_CHANNEL_ID_1');

            callback.getCall(0).args[1].comments[1].author.name.should.equal('Author Name 2');
            callback.getCall(0).args[1].comments[1].author.image.should.equal('image2.jpg');
            callback.getCall(0).args[1].comments[1].date.should.equal(1427066581000);
            callback.getCall(0).args[1].comments[1].content.should.equal('Some Content 2');
            callback.getCall(0).args[1].comments[1].channel.id.should.equal('SOME_CHANNEL_ID_2');

            callback.getCall(0).args[1].comments[2].author.name.should.equal('Author Name 3');
            callback.getCall(0).args[1].comments[2].author.image.should.equal('image3.jpg');
            callback.getCall(0).args[1].comments[2].date.should.equal(1427152981000);
            callback.getCall(0).args[1].comments[2].content.should.equal('Some Content 3');
            callback.getCall(0).args[1].comments[2].channel.id.should.equal('SOME_CHANNEL_ID_3');

            callback.getCall(0).args[1].comments[3].author.name.should.equal('Author Name 4');
            callback.getCall(0).args[1].comments[3].author.image.should.equal('image4.jpg');
            callback.getCall(0).args[1].comments[3].date.should.equal(1427239381000);
            callback.getCall(0).args[1].comments[3].content.should.equal('Some Content 4');
            callback.getCall(0).args[1].comments[3].channel.id.should.equal('SOME_CHANNEL_ID_4');

            callback.getCall(0).args[1].comments[4].author.name.should.equal('Author Name 5');
            callback.getCall(0).args[1].comments[4].author.image.should.equal('image5.jpg');
            callback.getCall(0).args[1].comments[4].date.should.equal(1427325781000);
            callback.getCall(0).args[1].comments[4].content.should.equal('Some Content 5');
            callback.getCall(0).args[1].comments[4].channel.id.should.equal('SOME_CHANNEL_ID_5');
        });

        it('should callback an error on failure', function() {
            sandbox.server.respondWith(REGEX_COMMENTS, [404, {}, '']);
            sandbox.server.respond();

            callback.should.have.been.calledWith(sinon.match.defined);
        });
    });
});
