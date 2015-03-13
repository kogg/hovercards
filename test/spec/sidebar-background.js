'use strict';

describe('sidebar-background', function() {
    var sandbox = sinon.sandbox.create();
    var sidebarBackground;

    beforeEach(function(done) {
        require(['sidebar-background'], function(_sidebarBackground) {
            sidebarBackground = _sidebarBackground;
            done();
        });
    });

    describe('when receiving pre-load message', function() {
        it('should send pre-load message', function() {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebarBackground();
            chrome.runtime.onMessage.addListener.yield({ msg: 'pre-load', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, $.noop);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'pre-load', content: 'something', id: 'SOME_ID' });
        });

        it('should send sidebar visible message', function() {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebarBackground();
            chrome.runtime.onMessage.addListener.yield({ msg: 'pre-load', content: 'something', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, $.noop);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', visible: true });
        });
    });

    describe('when receiving interest message', function() {
        it('should send sidebar important visible message if interested=true', function() {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebarBackground();
            chrome.runtime.onMessage.addListener.yield({ msg: 'interest', interested: true }, { tab: { id: 'TAB_ID' } }, $.noop);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', visible: true, important: true });
        });

        it('should send sidebar null visible message if interested=null', function() {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebarBackground();
            chrome.runtime.onMessage.addListener.yield({ msg: 'interest', interested: null }, { tab: { id: 'TAB_ID' } }, $.noop);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', visible: null });
        });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
