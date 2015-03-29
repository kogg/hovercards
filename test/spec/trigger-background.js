'use strict';

describe('trigger-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['trigger-background'], function(triggerBackground) {
            sandbox.stub(chrome.pageAction, 'setIcon');
            sandbox.stub(chrome.pageAction, 'show');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.stub(chrome.tabs, 'sendMessage');
            // FIXME Not REALLY the best way to handle this
            var state = {};
            chrome.tabs.sendMessage
                .withArgs('TAB_ID', { msg: 'getstate' }, sinon.match.func)
                .yields(state);
            triggerBackground();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should send msg:load[details] on ready > activate[details]', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', content: 'something', id: 'SOME_ID' });
    });

    it('should not send anything on ready > activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should send msg:load[details] on ready > hover[details] > activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'hover', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', content: 'something', id: 'SOME_ID' });
    });

    it('should send msg:hide on ready > hover[details] > unhover > activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'hover', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'unhover' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should send msg:hide on ready > activate[details] > activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should send msg:hide on ready > activate[details] > activate[same details]', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should not send anything when not ready', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.not.have.been.calledWith('TAB_ID', { msg: 'load', content: 'something', id: 'SOME_ID' });
    });

    it('should send msg:load[details] on activate[details] > ready', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', content: 'something', id: 'SOME_ID' });
    });
});
