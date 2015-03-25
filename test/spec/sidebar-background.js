'use strict';

describe('sidebar (background)', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['sidebar'], function(sidebar) {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebar.background();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('when receiving trigger message', function() {
        beforeEach(function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'trigger', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        });

        it('should send maybe message', function() {
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', show: 'maybe' });
        });
    });

    describe('when receiving untrigger message', function() {
        beforeEach(function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'untrigger' }, { tab: { id: 'TAB_ID' } });
        });

        it('should send maybenot message', function() {
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', show: 'maybenot' });
        });
    });
});
