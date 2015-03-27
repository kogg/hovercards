'use strict';

describe('sidebar-background', function() {
    var sandbox = sinon.sandbox.create();
    var sidebarBackgroundObj;

    beforeEach(function(done) {
        require(['sidebar-background'], function(sidebarBackground) {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebarBackgroundObj = sidebarBackground();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on deck/undeck', function() {
        it('should do nothing on undeck', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' }, { tab: { id: 'TAB_ID' } });
            expect(chrome.tabs.sendMessage).to.not.have.been.called;
        });

        it('should do nothing on undodeck', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'undodeck' }, { tab: { id: 'TAB_ID' } });
            expect(chrome.tabs.sendMessage).to.not.have.been.called;
        });

        it('should do nothing on deck', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            expect(chrome.tabs.sendMessage).to.not.have.been.called;
        });

        it('should send load on deck > undeck', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' }, { tab: { id: 'TAB_ID' } });
            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', content: 'something', id: 'SOME_ID' });
        });

        it('should send hide on deck > undeck > deck > undeck if same deck', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' }, { tab: { id: 'TAB_ID' } });
            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
        });

        it('should send nothing on deck > undodeck > undeck', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undodeck' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' }, { tab: { id: 'TAB_ID' } });
            expect(chrome.tabs.sendMessage).to.not.have.been.called;
        });

        it('should send first deck on deck > deck > undodeck > undeck', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something-else', id: 'SOME_OTHER_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undodeck' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' }, { tab: { id: 'TAB_ID' } });
            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', content: 'something', id: 'SOME_ID' });
        });

        it('should send hide on deck > undeck > undeck', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' }, { tab: { id: 'TAB_ID' } });
            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
        });

        it('should send show on deck > undeck > undeck > undeck', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' }, { tab: { id: 'TAB_ID' } });
            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'show' });
        });
    });
});
