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
            notificationsBackground.sendNotification('TAB_ID', 'sometype', 'someinstance');
            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'sometype', instance: 'someinstance' });
        });

        it('should set storage', function() {
            notificationsBackground.sendNotification('TAB_ID', 'sometype', 'someinstance');
            expect(chrome.storage.sync.set).to.have.been.calledWith({ 'sometype-someinstance': true });
        });

        it('should not send notification if storage is set', function() {
            chrome.storage.sync.get.withArgs('sometype-someinstance').yields({ 'sometype-someinstance': true });
            notificationsBackground.sendNotification('TAB_ID', 'sometype', 'someinstance');
            expect(chrome.tabs.sendMessage).to.not.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'sometype', instance: 'someinstance' });
        });

        it('should not set storage if storage is set', function() {
            chrome.storage.sync.get.withArgs('sometype-someinstance').yields({ 'sometype-someinstance': true });
            notificationsBackground.sendNotification('TAB_ID', 'sometype', 'someinstance');
            expect(chrome.storage.sync.set).to.not.have.been.calledWith({ 'sometype-someinstance': true });
        });
    });

    describe('on hover', function() {
        it('should #sendNotification(TAB_ID, provider, content)', function() {
            sandbox.stub(notificationsBackground, 'sendNotification');
            notificationsBackground.init();
            chrome.runtime.onMessage.addListener.yield({ msg: 'hover', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            expect(notificationsBackground.sendNotification).to.have.been.calledWith('TAB_ID', 'somewhere', 'something');
        });
    });

    describe('on loaded', function() {
        it('should #sendNotification(TAB_ID, "hovercards", "loaded")', function() {
            sandbox.stub(notificationsBackground, 'sendNotification');
            notificationsBackground.init();
            chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });
            expect(notificationsBackground.sendNotification).to.have.been.calledWith('TAB_ID', 'hovercards', 'loaded');
        });
    });
});
