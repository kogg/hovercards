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
        beforeEach(function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'youtube-video', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        });

        it('should send cards message', function() {
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'cards' });
        });
    });
});
