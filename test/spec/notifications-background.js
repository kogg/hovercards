'use strict';

describe('notifications-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['notifications-background'], function(notificationsBackground) {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.stub(chrome.tabs, 'sendMessage');
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
});
