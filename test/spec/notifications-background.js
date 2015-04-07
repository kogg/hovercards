'use strict';

describe('notifications-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['notifications-background'], function(notificationsBackground) {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.storage.sync, 'get');
            sandbox.stub(chrome.storage.sync, 'set');
            chrome.storage.sync.get.yields({ });
            notificationsBackground.init();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('intro', function() {
        it('should send firsthover on notify:firsthover', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firsthover' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firsthover' });
        });

        it('should send firstload on notify:firstload', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firstload' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firstload' });
        });

        it('should send firsthide on notify:firsthide', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firsthide' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firsthide' });
        });

        it('should not send notify:firsthover on notify:firsthover if sync intro === true', function() {
            chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firsthover' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firsthover' });
        });

        it('should not send notify:firstload on notify:firstload if sync intro === true', function() {
            chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firstload' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firstload' });
        });

        it('should not send notify:firsthide on notify:firsthide if sync intro === true', function() {
            chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firsthide' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firsthide' });
        });

        it('should not send firsthover on notify:firsthover * 2', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firsthover' }, { tab: { id: 'TAB_ID' } });
            var callCount = chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'notify', type: 'firsthover' }).callCount;
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firsthover' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'notify', type: 'firsthover' }).callCount).to.equal(callCount);
        });

        it('should not send firstload on notify:firstload * 2', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firstload' }, { tab: { id: 'TAB_ID' } });
            var callCount = chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'notify', type: 'firstload' }).callCount;
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firstload' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'notify', type: 'firstload' }).callCount).to.equal(callCount);
        });

        it('should not send firsthide on notify:firsthide * 2', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firsthide' }, { tab: { id: 'TAB_ID' } });
            var callCount = chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'notify', type: 'firsthide' }).callCount;
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firsthide' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'notify', type: 'firsthide' }).callCount).to.equal(callCount);
        });

        it('should set storage intro on notify:firsthover, notify:firstload, notify:firsthide', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firsthover' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firsthide' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'firstload' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.storage.sync.set).to.have.been.calledWith({ intro: true });
        });
    });
});
