'use strict';

describe('youtube-video-background', function() {
    var sandbox = sinon.sandbox.create();
    var Squire;
    var youtubeApi;

    before(function(done) {
        require(['Squire'], function(_Squire) {
            Squire = _Squire;
            done();
        });
    });

    beforeEach(function(done) {
        youtubeApi = { video: sandbox.stub(), channel: sandbox.stub(), comments: sandbox.stub() };
        new Squire()
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
            youtubeApi.comments.yields(null, { content: 'youtube-comments', id: 'SOME_VIDEO_ID' });
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_VIDEO_ID' }, { tab: { id: 'TAB_ID' } });
        });

        it('should send cards message', function() {
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID');
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('msg', 'cards'));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('id', 'youtube-video-0'));
        });

        it('should send cards message with unique id', function() {
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('id', 'youtube-video-0'));
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_VIDEO_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('id', 'youtube-video-1'));
        });

        it('should call youtube-api for video', function() {
            youtubeApi.video.should.have.been.calledWith('SOME_VIDEO_ID');
        });

        it('should send card message for video', function() {
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID');
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('msg', 'card'));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('id', 'youtube-video-0'));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('card', sinon.match.has('content', 'youtube-video')));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('card', sinon.match.has('id', 'SOME_VIDEO_ID')));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('card', sinon.match.has('priority', 0)));
        });

        it('should call youtube-api for channel', function() {
            youtubeApi.channel.should.have.been.calledWith('SOME_CHANNEL_ID');
        });

        it('should send card message for channel', function() {
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID');
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('msg', 'card'));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('id', 'youtube-video-0'));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('card', sinon.match.has('content', 'youtube-channel')));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('card', sinon.match.has('id', 'SOME_CHANNEL_ID')));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('card', sinon.match.has('priority', 1)));
        });

        it('should call youtube-api for comments', function() {
            youtubeApi.comments.should.have.been.calledWith('SOME_VIDEO_ID');
        });

        it('should send card message for channel', function() {
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID');
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('msg', 'card'));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('id', 'youtube-video-0'));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('card', sinon.match.has('content', 'youtube-comments')));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('card', sinon.match.has('id', 'SOME_VIDEO_ID')));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('card', sinon.match.has('priority', 2)));
        });
    });
});
