'use strict';

describe('notifications-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['notifications-background'], function(notificationsBackground) {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.storage.sync, 'get');
            sandbox.stub(chrome.storage.sync, 'set');
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'hasloaded' }).yields(undefined);
            chrome.storage.sync.get.yields({ });
            notificationsBackground.init();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on hover', function() {
        it('should send notify', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hover', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'somewhere', instance: 'something' });
        });

        it('should not send notify if storage is set', function() {
            chrome.storage.sync.get.withArgs('somewhere-something').yields({ 'somewhere-something': true });
            chrome.runtime.onMessage.addListener.yield({ msg: 'hover', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'somewhere', instance: 'something' });
        });

        it('should set storage', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hover', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.storage.sync.set).to.have.been.calledWith({ 'somewhere-something': true });
        });
    });

    describe('on loaded', function() {
        it('should send notify[hovercards.loaded]', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'hovercards', instance: 'loaded' });
        });

        it('should set hasloaded', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { hasloaded: true } });
        });

        it('should not set storage[firsttime]', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.storage.sync.set).not.to.have.been.calledWith({ 'firsttime': true });
        });

        it('should not send notify[hovercards.loaded] if storage[firsttime] is set', function() {
            chrome.storage.sync.get.withArgs('firsttime').yields({ 'firsttime': true });
            chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'hovercards', instance: 'loaded' });
        });

        it('should not set hasloaded if storage[firsttime] is set', function() {
            chrome.storage.sync.get.withArgs('firsttime').yields({ 'firsttime': true });
            chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'set', value: { hasloaded: true } });
        });

        it('should not send notify[hovercards.loaded] if hasloaded is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'hasloaded' }).yields(true);
            chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'hovercards', instance: 'loaded' });
        });

        it('should not set loaded if hasloaded is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'hasloaded' }).yields(true);
            chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'set', value: { hasloaded: true } });
        });
    });

    describe('on hidden', function() {
        it('should not send notify[hovercards.hidden]', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'hovercards', instance: 'hidden' });
        });

        it('should send notify[hovercards.hidden] if hasloaded is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'hasloaded' }).yields(true);
            chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'hovercards', instance: 'hidden' });
        });

        it('should set storage[firsttime] if hasloaded is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'hasloaded' }).yields(true);
            chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.storage.sync.set).to.have.been.calledWith({ 'firsttime': true });
        });

        it('should not send notify[hovercards.hidden] if hasloaded is set & storage[firsttime] is set', function() {
            chrome.storage.sync.get.withArgs('firsttime').yields({ 'firsttime': true });
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'hasloaded' }).yields(true);
            chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'hovercards', instance: 'hidden' });
        });

        it('should set storage[firsttime] if hasloaded is set & storage[firsttime] is set', function() {
            chrome.storage.sync.get.withArgs('firsttime').yields({ 'firsttime': true });
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'hasloaded' }).yields(true);
            chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.storage.sync.set).not.to.have.been.calledWith({ 'firsttime': true });
        });
    });
});
