'use strict';

describe('sidebar-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['sidebar-background'], function(sidebarBackground) {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebarBackground();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('when receiving triggered message', function() {
        beforeEach(function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'triggered', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } });
        });

        it('should send maybe message', function() {
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', show: 'maybe' });
        });
    });

    describe('when receiving untriggered message', function() {
        beforeEach(function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'untriggered' }, { tab: { id: 'TAB_ID' } });
        });

        it('should send maybenot message', function() {
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', show: 'maybenot' });
        });
    });

    describe('when receiving interested message', function() {
        beforeEach(function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'interested' }, { tab: { id: 'TAB_ID' } });
        });

        it('should send on message', function() {
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', show: 'on' });
        });
    });
});
