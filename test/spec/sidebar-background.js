'use strict';

describe('sidebar (background)', function() {
    var sandbox = sinon.sandbox.create();
    var sidebar;

    beforeEach(function(done) {
        require(['sidebar'], function(_sidebar) {
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

    describe('when receiving trigger message', function() {
        it('should put content on deck', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'trigger', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
            sidebar.deck.should.deep.equal({ content: 'something', id: 'SOME_ID' });
        });
    });

    describe('when receiving untrigger message', function() {
        it('should take content off deck', function() {
            sidebar.deck = { content: 'something', id: 'SOME_ID' };
            chrome.runtime.onMessage.addListener.yield({ msg: 'untrigger' }, { tab: { id: 'TAB_ID' } });
            expect(sidebar.deck).to.equal(null);
        });
    });
});
