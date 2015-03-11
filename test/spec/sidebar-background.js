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

    describe('when receiving info', function() {
        it('should tell sidebar to load iframe', function() {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebarBackground();
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', network: 'somewhere', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, $.noop);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'load', network: 'somewhere', id: 'SOME_ID' });
        });

        it('should tell sidebar to be visible', function() {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebarBackground();
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', network: 'somewhere', id: 'SOME_ID' }, { tab: { id: 'TAB_ID' } }, $.noop);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', visible: true });
        });
    });

    describe('when receiving interest', function() {
        it('interested=true, should tell sidebar it is important to be visible', function() {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebarBackground();
            chrome.runtime.onMessage.addListener.yield({ msg: 'interest', interested: true }, { tab: { id: 'TAB_ID' } }, $.noop);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', visible: true, important: true });
        });

        it('interested=null, should tell sidebar to have null visibility', function() {
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
