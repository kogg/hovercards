'use strict';

describe('trigger-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['trigger-background'], function(triggerBackground) {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            triggerBackground();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should send msg:load[details] on activate[details]', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', content: 'something', id: 'SOME_ID' });
    });

    it('should not send anything on activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should send msg:load[details] on hover[details] > activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'hover', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', content: 'something', id: 'SOME_ID' });
    });

    it('should send msg:hide on hover[details] > unhover > activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'hover', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'unhover' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should send msg:hide on activate[details] > activate', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should send msg:hide on activate[details] > activate[same details]', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        chrome.runtime.onMessage.addListener.yield({ msg: 'activate', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });
});
