'use strict';

describe('sidebar', function() {
    var sandbox = sinon.sandbox.create();
    var sidebar;

    beforeEach(function(done) {
        require(['sidebar'], function(_sidebar) {
            sidebar = _sidebar;
            done();
        });
    });

    it('should be hidden', function() {
        sidebar().appendTo('#sandbox').should.be.hidden;
    });

    it('should contain an iframe with no src', function() {
        var sidebarObj = sidebar().appendTo('#sandbox');
        sidebarObj.should.have.descendants('iframe');
        sidebarObj.children('iframe').should.have.prop('src', '');
    });

    describe('when receiving pre-load message', function() {
        it('should give iframe a src', function() {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'pre-load', content: 'something', id: 'SOME_ID' }, {}, $.noop);
            sidebarObj.children('iframe').should.have.prop('src', 'chrome-extension://extension_id/sidebar.html?content=something&id=SOME_ID');
        });
    });

    describe('when receiving sidebar message', function() {
        it('should be visible if visible=true', function() {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true }, {}, $.noop);
            sidebarObj.should.be.visible;
        });

        it('should be hidden within 2 seconds of visible=true if visible=null', function() {
            var clock = sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true }, {}, $.noop);
            clock.tick(1999);
            sidebarObj.should.be.visible;
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: null }, {}, $.noop);
            sidebarObj.should.be.hidden;
        });

        it('should stay visible after 2 seconds of visible=true if visible=null', function() {
            var clock = sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true }, {}, $.noop);
            clock.tick(2000);
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: null }, {}, $.noop);
            sidebarObj.should.be.visible;
        });

        it('should stay visible within 2 seconds of visible=true && important=true if visible=null', function() {
            var clock = sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true, important: true }, {}, $.noop);
            clock.tick(1999);
            sidebarObj.should.be.visible;
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: null }, {}, $.noop);
            sidebarObj.should.be.visible;
        });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
