'use strict';

describe('trigger-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['trigger-background'], function(triggerBackground) {
            sandbox.stub(chrome.pageAction, 'setIcon');
            sandbox.stub(chrome.pageAction, 'show');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.stub(chrome.tabs, 'sendMessage');
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(undefined);
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'sent' }).yields(undefined);
            triggerBackground.init();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on ready', function() {
        it('should set ready', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { ready: true } });
        });

        it('should not send load', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'load'));
        });

        it('should send load if sent is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'sent' }).yields('URL');
            chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', url: 'URL' });
        });
    });

    describe('on activate', function() {
        it('should set sent', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate', url: 'URL' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { sent: 'URL' } });
        });

        it('should not send anything', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate', url: 'URL' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'load'));
            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'hide'));
        });

        it('should send load if ready is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true);
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate', url: 'URL' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', url: 'URL' });
        });

        it('should send hide if ready is set & sent === URL', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true);
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'sent' }).yields('URL');
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate', url: 'URL' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
        });
    });

    describe('on hide', function() {
        it('should unset sent', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { sent: null } });
        });

        it('should not send hide', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'hide'));
        });

        it('should send hide if ready is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true);
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
        });
    });
});
