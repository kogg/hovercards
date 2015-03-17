'use strict';

describe('youtube-video-background', function() {
    var sandbox = sinon.sandbox.create();
    var async;
    var injector;
    var youtubeApi;

    before(function(done) {
        require(['Squire', 'async'], function(Squire, _async) {
            injector = new Squire();
            async = _async;
            done();
        });
    });

    beforeEach(function(done) {
        youtubeApi = { video: sandbox.stub(), channel: sandbox.stub() };
        injector
            .mock('youtube-api', youtubeApi)
            .require(['youtube-video-background'], function(youtubeVideoBackground) {
                sandbox.stub(chrome.tabs, 'sendMessage');
                sandbox.stub(chrome.runtime.onMessage, 'addListener');
                youtubeVideoBackground();
                done();
            });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('when receiving triggered message', function() {
        beforeEach(function() {
            youtubeApi.video.yields(null, { content: 'youtube-video', id: 'SOME_VIDEO_ID', channel: { id: 'SOME_CHANNEL_ID' } });
            youtubeApi.channel.yields(null, { content: 'youtube-channel', id: 'SOME_CHANNEL_ID' });
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_VIDEO_ID' }, { tab: { id: 'TAB_ID' } });
        });

        it('should send cards message', function(done) {
            // TODO Is using this a good idea? Solves my problem...
            async.nextTick(function() {
                chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'cards')
                                                                         .and(sinon.match.has('cards', sinon.match.array)));
                done();
            });
        });

        it('should send cards message with youtube-video', function(done) {
            // TODO Is using this a good idea? Solves my problem...
            async.nextTick(function() {
                // TODO Is there a better solution than this crazy for loop matcher?
                chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('cards', sinon.match(function(cards) {
                    for (var i = 0; i < cards.length; i++) {
                        if (cards[i].content === 'youtube-video' && cards[i].id === 'SOME_VIDEO_ID') {
                            return true;
                        }
                    }
                    return false;
                }, 'bad!')));
                done();
            });
        });

        it('should send cards message with youtube-channel', function(done) {
            // TODO Is using this a good idea? Solves my problem...
            async.nextTick(function() {
                // TODO Is there a better solution than this crazy for loop matcher?
                chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('cards', sinon.match(function(cards) {
                    for (var i = 0; i < cards.length; i++) {
                        if (cards[i].content === 'youtube-channel' && cards[i].id === 'SOME_CHANNEL_ID') {
                            return true;
                        }
                    }
                    return false;
                }, 'bad!')));
                done();
            });
        });
    });
});
