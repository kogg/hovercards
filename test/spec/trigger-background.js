'use strict';

describe('trigger-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['trigger-background'], function(triggerBackground) {
            sandbox.stub(chrome.pageAction, 'setIcon');
            sandbox.stub(chrome.pageAction, 'show');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.stub(chrome.tabs, 'sendMessage');
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'maybe' }).yields(undefined);
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
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'sent' }).yields({ provider: 'somewhere', content: 'something', id: 'SOME_ID' });
            chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', provider: 'somewhere', content: 'something', id: 'SOME_ID' });
        });
    });

    describe('on hover', function() {
        it('should set maybe', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hover', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { maybe: { provider: 'somewhere', content: 'something', id: 'SOME_ID' } } });
        });
    });

    describe('on unhover', function() {
        it('should unset maybe', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'unhover' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { maybe: null } });
        });
    });

    describe('on activate[null]', function() {
        it('should unset maybe', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { maybe: null } });
        });

        it('should set sent to maybe', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'maybe' }).yields({ provider: 'somewhere', content: 'something', id: 'SOME_ID' });
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { sent: { provider: 'somewhere', content: 'something', id: 'SOME_ID' } } });
        });

        it('should not send anything', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'load'));
            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'hide'));
        });

        it('should send load[maybe] if maybe & ready are set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true);
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'maybe' }).yields({ provider: 'somewhere', content: 'something', id: 'SOME_ID' });
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', provider: 'somewhere', content: 'something', id: 'SOME_ID' });
        });

        it('should send hide if maybe is unset & ready is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true);
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
        });
    });

    describe('on activate[details]', function() {
        it('should unset maybe', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { maybe: null } });
        });

        it('should set sent to details', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { sent: { provider: 'somewhere', content: 'something', id: 'SOME_ID' } } });
        });

        it('should not send anything', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'load'));
            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'hide'));
        });

        it('should send load[details] if ready is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true);
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', provider: 'somewhere', content: 'something', id: 'SOME_ID' });
        });

        it('should send hide if ready is set & sent===details', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true);
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'sent' }).yields({ provider: 'somewhere', content: 'something', id: 'SOME_ID' });
            chrome.runtime.onMessage.addListener.yield({ msg: 'activate', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
        });
    });

    describe('on hide', function() {
        it('should unset maybe', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { maybe: null } });
        });

        it('should unset current', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' }, { tab: { id: 'TAB_ID' } });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { current: null } });
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
