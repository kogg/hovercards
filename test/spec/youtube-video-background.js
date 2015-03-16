'use strict';

describe('youtube-video-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['youtube-video-background'], function(youtubeVideoBackground) {
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
        it('should send cards message', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'cards'));
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', sinon.match.has('cards', sinon.match.array));
        });

        it('should send youtube-video card', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            var cards = chrome.tabs.sendMessage.getCall(0).args[1].cards;
            cards[0].should.have.property('content', 'youtube-video');
        });
    });
});
