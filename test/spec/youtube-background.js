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

    describe('on youtube.youtube-video', function() {
        it('should call youtube\'s API for youtube-video', function() {
            var callback = sandbox.spy();
            chrome.runtime.onMessage.addListener.yield({ msg: 'data', content: 'youtube-video', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, callback);

            var url = purl(sandbox.server.requests[0].url);
            expect((url.attr('protocol') + '://' + url.attr('host') + url.attr('path'))).to.equal('https://www.googleapis.com/youtube/v3/videos');
            expect(url.param('id')).to.equal('SOME_ID');
            expect(url.param('part')).to.equal('snippet,statistics');
            expect(url.param('key')).to.not.be.undefined;
            expect(url.param('key')).to.not.be.null;
        });

        it('should callback a youtubeVideo', function() {
            var callback = sandbox.spy();
            chrome.runtime.onMessage.addListener.yield({ msg: 'data', content: 'youtube-video', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, callback);
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
            sandbox.server.respond();

            expect(callback).to.have.been.calledWith({ image:       'image.jpg',
                                                       title:       'Some Title',
                                                       description: 'Some Description',
                                                       date:        1302060119000,
                                                       views:       1000,
                                                       likes:       2000,
                                                       dislikes:    3000,
                                                       channelId:   'SOME_CHANNEL_ID' });
        });
    });

    describe('on youtube.youtube-channel', function() {
        it('should call youtube\'s API for youtube-channel', function() {
            var callback = sandbox.spy();
            chrome.runtime.onMessage.addListener.yield({ msg: 'data', content: 'youtube-channel', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, callback);

            var url = purl(sandbox.server.requests[0].url);
            expect((url.attr('protocol') + '://' + url.attr('host') + url.attr('path'))).to.equal('https://www.googleapis.com/youtube/v3/channels');
            expect(url.param('id')).to.equal('SOME_ID');
            expect(url.param('part')).to.equal('snippet,statistics');
            expect(url.param('key')).to.not.be.undefined;
            expect(url.param('key')).to.not.be.null;
        });

        it('should callback a youtubeChannel', function() {
            var callback = sandbox.spy();
            chrome.runtime.onMessage.addListener.yield({ msg: 'data', content: 'youtube-channel', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, callback);
            sandbox.server.respondWith(/^https:\/\/www.googleapis.com\/youtube\/v3\/channels/,
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify({ items: [{ snippet:    { thumbnails: { medium: { url: 'image.jpg' } },
                                                                                 localized:  { title:       'Some Title',
                                                                                               description: 'Some Description' } },
                                                                   statistics: { viewCount:       2000,
                                                                                 subscriberCount: 3000,
                                                                                 videoCount:      1000 } }] })]);
            sandbox.server.respond();

            expect(callback).to.have.been.calledWith({ image:       'image.jpg',
                                                       title:       'Some Title',
                                                       description: 'Some Description',
                                                       videos:       1000,
                                                       views:        2000,
                                                       subscribers:  3000 });
        });
    });

    describe('on youtube.youtube-comments-v2', function() {
        /*jshint multistr: true */
        var COMMENTS_RESPONSE = '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:openSearch="http://a9.com/-/spec/opensearchrss/1.0/" xmlns:yt="http://gdata.youtube.com/schemas/2007">\
                                     <entry>\
                                         <published>2015-03-21T23:23:01.000Z</published>\
                                         <content type="text">Some Content 1</content>\
                                         <author>\
                                             <name>Author Name 1</name>\
                                             <uri>https://gdata.youtube.com/feeds/api/users/USER_ID_1</uri>\
                                         </author>\
                                         <yt:channelId>SOME_CHANNEL_ID_1</yt:channelId>\
                                     </entry>\
                                     <entry>\
                                         <published>2015-03-22T23:23:01.000Z</published>\
                                         <content type="text">Some Content 2</content>\
                                         <author>\
                                             <name>Author Name 2</name>\
                                             <uri>https://gdata.youtube.com/feeds/api/users/USER_ID_2</uri>\
                                         </author>\
                                         <yt:channelId>SOME_CHANNEL_ID_2</yt:channelId>\
                                     </entry>\
                                     <entry>\
                                         <published>2015-03-23T23:23:01.000Z</published>\
                                         <content type="text">Some Content 3</content>\
                                         <author>\
                                             <name>Author Name 3</name>\
                                             <uri>https://gdata.youtube.com/feeds/api/users/USER_ID_3</uri>\
                                         </author>\
                                         <yt:channelId>SOME_CHANNEL_ID_3</yt:channelId>\
                                     </entry>\
                                     <entry>\
                                         <published>2015-03-24T23:23:01.000Z</published>\
                                         <content type="text">Some Content 4</content>\
                                         <author>\
                                             <name>Author Name 4</name>\
                                             <uri>https://gdata.youtube.com/feeds/api/users/USER_ID_4</uri>\
                                         </author>\
                                         <yt:channelId>SOME_CHANNEL_ID_4</yt:channelId>\
                                     </entry>\
                                     <entry>\
                                         <published>2015-03-25T23:23:01.000Z</published>\
                                         <content type="text">Some Content 5</content>\
                                         <author>\
                                             <name>Author Name 5</name>\
                                             <uri>https://gdata.youtube.com/feeds/api/users/USER_ID_5</uri>\
                                         </author>\
                                         <yt:channelId>SOME_CHANNEL_ID_5</yt:channelId>\
                                     </entry>\
                                 </feed>';

        it('should call youtube\'s API for youtube-comments-v2', function() {
            var callback = sandbox.spy();
            chrome.runtime.onMessage.addListener.yield({ msg: 'data', content: 'youtube-comments-v2', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, callback);

            var url = purl(sandbox.server.requests[0].url);
            expect((url.attr('protocol') + '://' + url.attr('host') + url.attr('path'))).to.equal('https://gdata.youtube.com/feeds/api/videos/SOME_ID/comments');
            expect(url.param('max-results')).to.equal('5');
        });

        it('should callback a youtubeComments', function() {
            var callback = sandbox.spy();
            chrome.runtime.onMessage.addListener.yield({ msg: 'data', content: 'youtube-comments-v2', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, callback);
            sandbox.server.respondWith(/^https:\/\/gdata.youtube.com\/feeds\/api\/videos\/SOME_ID\/comments/, [200, { 'Content-Type': 'application/xml' }, COMMENTS_RESPONSE]);
            sandbox.server.respond();

            expect(callback).to.have.been.calledWith({ comments: [{ name:      'Author Name 1',
                                                                    userId:    'USER_ID_1',
                                                                    date:      1426980181000,
                                                                    content:   'Some Content 1',
                                                                    channelId: 'SOME_CHANNEL_ID_1' },
                                                                  { name:      'Author Name 2',
                                                                    userId:    'USER_ID_2',
                                                                    date:      1427066581000,
                                                                    content:   'Some Content 2',
                                                                    channelId: 'SOME_CHANNEL_ID_2' },
                                                                  { name:      'Author Name 3',
                                                                    userId:    'USER_ID_3',
                                                                    date:      1427152981000,
                                                                    content:   'Some Content 3',
                                                                    channelId: 'SOME_CHANNEL_ID_3' },
                                                                  { name:      'Author Name 4',
                                                                    userId:    'USER_ID_4',
                                                                    date:      1427239381000,
                                                                    content:   'Some Content 4',
                                                                    channelId: 'SOME_CHANNEL_ID_4' },
                                                                  { name:      'Author Name 5',
                                                                    userId:    'USER_ID_5',
                                                                    date:      1427325781000,
                                                                    content:   'Some Content 5',
                                                                    channelId: 'SOME_CHANNEL_ID_5' }] });
        });
    });

    describe('on youtube.youtube-user-v2', function() {
        it('should call youtube\'s API for youtube-user-v2', function() {
            var callback = sandbox.spy();
            chrome.runtime.onMessage.addListener.yield({ msg: 'data', content: 'youtube-user-v2', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, callback);

            var url = purl(sandbox.server.requests[0].url);
            expect((url.attr('protocol') + '://' + url.attr('host') + url.attr('path'))).to.equal('https://gdata.youtube.com/feeds/api/users/SOME_ID');
        });

        it('should callback a youtubeVideo', function() {
            var callback = sandbox.spy();
            chrome.runtime.onMessage.addListener.yield({ msg: 'data', content: 'youtube-user-v2', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, callback);
            /*jshint multistr: true */
            sandbox.server.respondWith(/^https:\/\/gdata.youtube.com\/feeds\/api\/users/,
                                       [200,
                                        { 'Content-Type': 'application/xml' },
                                        '<?xml version="1.0" encoding="UTF-8"?>\
                                        <entry xmlns="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://gdata.youtube.com/schemas/2007">\
                                            <media:thumbnail url="image.jpg" />\
                                        </entry>']);
            sandbox.server.respond();

            expect(callback).to.have.been.calledWith({ image: 'image.jpg' });
        });
    });
});
