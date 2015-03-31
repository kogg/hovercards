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
            triggerBackground.init();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should send msg:load[details] on ready > activate[details]', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', provider: 'somewhere', content: 'something', id: 'SOME_ID' });
    });

    it('should send msg:hide on hide', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'hide' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should not send anything on ready > activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should send msg:load[details] on ready > hover[details] > activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'hover', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', provider: 'somewhere', content: 'something', id: 'SOME_ID' });
    });

    it('should send msg:hide on ready > hover[details] > unhover > activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'hover', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'unhover' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should send msg:hide on ready > activate[details] > activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should send msg:hide on ready > activate[details] > activate[same details]', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should not send anything when not ready', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.not.have.been.calledWith('TAB_ID', { msg: 'load', provider: 'somewhere', content: 'something', id: 'SOME_ID' });
    });

    it('should send msg:load[details] on activate[details] > ready', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', provider: 'somewhere', content: 'something', id: 'SOME_ID' });
    });

    it('should show pageAction on ready', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.pageAction.show).to.have.been.calledWith('TAB_ID');
    });

    it('should setIcon pageAction on ready > hover[details]', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'hover', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.pageAction.setIcon).to.have.been.calledWith({ tabId: 'TAB_ID',
                                                                    path:  { '19': 'images/omni-somewhere-19.png',
                                                                             '38': 'images/omni-somewhere-38.png' } });
    });

    it('should setIcon back pageAction on ready > hover[details] > unhover', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'ready' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'hover', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'unhover' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.pageAction.setIcon).to.have.been.calledWith({ tabId: 'TAB_ID',
                                                                    path:  { '19': 'images/omni-default-19.png',
                                                                             '38': 'images/omni-default-38.png' } });
    });
});
