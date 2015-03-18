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
        youtubeApi = { video: sandbox.stub(), channel: sandbox.stub() };
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
        it('should call youtube-api for video', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_VIDEO_ID' }, { tab: { id: 'TAB_ID' } });
            youtubeApi.video.should.have.been.calledWith('SOME_VIDEO_ID');
            youtubeApi.video.should.have.been.calledWith(sinon.match.any, sinon.match.func
                                                                      .or(sinon.match.typeOf('null'))
                                                                      .or(sinon.match.typeOf('undefined')));
        });

        it('should send card message for video', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_VIDEO_ID' }, { tab: { id: 'TAB_ID' } });
            youtubeApi.video.yield(null, { content: 'youtube-video', id: 'SOME_VIDEO_ID', channel: { id: 'SOME_CHANNEL_ID' } });
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID');
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('msg', 'card'));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('id', 'youtube-video-0'));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('priority', 0));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('card', { content: 'youtube-video', id: 'SOME_VIDEO_ID', channel: { id: 'SOME_CHANNEL_ID' } }));
        });

        it('should call youtube-api for channel after video', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_VIDEO_ID' }, { tab: { id: 'TAB_ID' } });
            youtubeApi.channel.should.not.have.been.called;
            youtubeApi.video.yield(null, { content: 'youtube-video', id: 'SOME_VIDEO_ID', channel: { id: 'SOME_CHANNEL_ID' } });
            youtubeApi.channel.should.have.been.calledWith('SOME_CHANNEL_ID');
            youtubeApi.channel.should.have.been.calledWith(sinon.match.any, sinon.match.func
                                                                        .or(sinon.match.typeOf('null'))
                                                                        .or(sinon.match.typeOf('undefined')));
        });

        it('should send card message for channel', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_VIDEO_ID' }, { tab: { id: 'TAB_ID' } });
            youtubeApi.video.yield(null, { content: 'youtube-video', id: 'SOME_VIDEO_ID', channel: { id: 'SOME_CHANNEL_ID' } });
            youtubeApi.channel.yield(null, { content: 'youtube-channel', id: 'SOME_CHANNEL_ID' });
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID');
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('msg', 'card'));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('id', 'youtube-video-0'));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('priority', 1));
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('card', { content: 'youtube-channel', id: 'SOME_CHANNEL_ID' }));
        });

        it('should send a different id each trigger', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_VIDEO_ID' }, { tab: { id: 'TAB_ID' } });
            youtubeApi.video.yield(null, { content: 'youtube-video', id: 'SOME_VIDEO_ID', channel: { id: 'SOME_CHANNEL_ID' } });
            youtubeApi.channel.yield(null, { content: 'youtube-channel', id: 'SOME_CHANNEL_ID' });
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('id', 'youtube-video-0'));
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_VIDEO_ID' }, { tab: { id: 'TAB_ID' } });
            youtubeApi.video.yield(null, { content: 'youtube-video', id: 'SOME_VIDEO_ID', channel: { id: 'SOME_CHANNEL_ID' } });
            youtubeApi.channel.yield(null, { content: 'youtube-channel', id: 'SOME_CHANNEL_ID' });
            chrome.tabs.sendMessage.should.have.been.calledWith(sinon.match.any, sinon.match.has('id', 'youtube-video-1'));
        });
    });
});
