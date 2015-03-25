'use strict';

describe('sidebar (background)', function() {
    var sandbox = sinon.sandbox.create();
    var sidebar;

    beforeEach(function(done) {
        require(['sidebar'], function(_sidebar) {
            sandbox.useFakeTimers();
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebar = _sidebar;
            sidebar.background();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on trigger', function() {
        it('should send deck message after 500ms', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'trigger', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            sandbox.clock.tick(500);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'deck', content: 'something', id: 'SOME_ID' });
        });

        it('should send only one deck message after 500ms, even if repeated', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'trigger', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'trigger', content: 'something-else', id: 'SOME_OTHER_ID' }, { tab: { id: 'TAB_ID' } });
            sandbox.clock.tick(500);
            chrome.tabs.sendMessage.should.not.have.been.calledWith('TAB_ID', { msg: 'deck', content: 'something', id: 'SOME_ID' });
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'deck', content: 'something-else', id: 'SOME_OTHER_ID' });
        });
    });

    describe('on untrigger', function() {
        it('should not send deck message if within 500ms of trigger', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'trigger', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'untrigger' }, { tab: { id: 'TAB_ID' } });
            sandbox.clock.tick(500);
            chrome.tabs.sendMessage.should.not.have.been.called;
        });

        it('should send deck message of previous trigger if within 500ms of trigger', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'trigger', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'trigger', content: 'something-else', id: 'SOME_OTHER_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'untrigger' }, { tab: { id: 'TAB_ID' } });
            sandbox.clock.tick(500);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'deck', content: 'something', id: 'SOME_ID' });
            chrome.tabs.sendMessage.should.not.have.been.calledWith('TAB_ID', { msg: 'deck', content: 'something-else', id: 'SOME_OTHER_ID' });
        });
    });

    describe('on shoot', function() {
        it('should send deck message if within 500ms of trigger', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'trigger', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'shoot' }, { tab: { id: 'TAB_ID' } });
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'deck', content: 'something', id: 'SOME_ID' });
        });

        it('should not send deck message if not within 500ms of trigger', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'shoot' }, { tab: { id: 'TAB_ID' } });
            chrome.tabs.sendMessage.should.not.have.been.calledWith('TAB_ID', { msg: 'deck', content: 'something', id: 'SOME_ID' });
        });

        it('should send undeck message', function() {
            sidebar.deck = { content: 'something', id: 'SOME_ID' };
            chrome.runtime.onMessage.addListener.yield({ msg: 'shoot' }, { tab: { id: 'TAB_ID' } });
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'undeck' });
        });
    });
});
