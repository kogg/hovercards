'use strict';

describe('notifications-background', function() {
    var sandbox = sinon.sandbox.create();
    var notificationsBackground;

    beforeEach(function(done) {
        require(['notifications-background'], function(_notificationsBackground) {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.storage.sync, 'get');
            sandbox.stub(chrome.storage.sync, 'set');
            chrome.storage.sync.get.yields({ });
            notificationsBackground = _notificationsBackground;
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('#sendNotification', function() {
        it('should send notification', function() {
            notificationsBackground.sendNotification('TAB_ID', 'somenotification');
            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notification', which: 'somenotification' });
        });

        it('should set storage', function() {
            notificationsBackground.sendNotification('TAB_ID', 'somenotification');
            expect(chrome.storage.sync.set).to.have.been.calledWith({ somenotification: true });
        });

        it('should not send notification if storage is set', function() {
            chrome.storage.sync.get.withArgs('somenotification').yields({ somenotification: true });
            notificationsBackground.sendNotification('TAB_ID', 'somenotification');
            expect(chrome.tabs.sendMessage).to.not.have.been.calledWith('TAB_ID', { msg: 'notification', which: 'somenotification' });
        });

        it('should not set storage if storage is set', function() {
            chrome.storage.sync.get.withArgs('somenotification').yields({ somenotification: true });
            notificationsBackground.sendNotification('TAB_ID', 'somenotification');
            expect(chrome.storage.sync.set).to.not.have.been.calledWith({ somenotification: true });
        });
    });

    describe('on hover', function() {
        beforeEach(function() {
            sandbox.stub(notificationsBackground, 'sendNotification');
            notificationsBackground.init();
        });

        it('should #sendNotification(TAB_ID, content) on hover', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hover', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            expect(notificationsBackground.sendNotification).to.have.been.calledWith('TAB_ID', 'something');
        });
    });
});
