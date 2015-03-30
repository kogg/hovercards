'use strict';

describe('notifications-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['notifications-background'], function(notificationsBackground) {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.storage.sync, 'get');
            chrome.storage.sync.get.yields({ });
            notificationsBackground.init();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should send firsthover on hover', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'hover', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notification', which: 'firsthover' });
    });

    it('should send firsthover on hover if in storage', function() {
        chrome.storage.sync.get.withArgs('firsthover').yields({ firsthover: true });
        chrome.runtime.onMessage.addListener.yield({ msg: 'hover', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.not.have.been.calledWith('TAB_ID', { msg: 'notification', which: 'firsthover' });
    });
});
