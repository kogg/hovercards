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

    it('should have class deckard-sidebar', function() {
        sidebar().appendTo('#sandbox').should.have.class('deckard-sidebar');
    });

    it('should be hidden', function() {
        sidebar().appendTo('#sandbox').should.be.hidden;
    });

    it('should contain an iframe with no src', function() {
        var sidebarObj = sidebar().appendTo('#sandbox');
        sidebarObj.should.have.descendants('iframe');
        sidebarObj.children('iframe').should.have.prop('src', '');
    });

    describe('when receiving load', function() {
        it('= visible, should have src', function() {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', network: 'somewhere', id: 'SOME_ID' }, {}, $.noop);
            sidebarObj.children('iframe').should.have.prop('src', 'chrome://extension_id/somewhere-sidebar.html');
        });
    });

    describe('when receiving display', function() {
        it('visible=true && important=true, should stay visible', function() {
            var clock = sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true, important: true }, {}, $.noop);
            sidebarObj.should.be.visible;
            clock.tick(2000);
            sidebarObj.should.be.visible;
        });

        it('visible=true, should be visible', function() {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true }, {}, $.noop);
            sidebarObj.should.be.visible;
        });

        it('visible=null, should be hidden within 2 seconds of visible=true', function() {
            var clock = sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true }, {}, $.noop);
            clock.tick(1999);
            sidebarObj.should.be.visible;
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: null }, {}, $.noop);
            sidebarObj.should.be.hidden;
        });

        it('visible=null, should stay visible after 2 seconds of visible=true', function() {
            var clock = sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true }, {}, $.noop);
            clock.tick(2000);
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: null }, {}, $.noop);
            sidebarObj.should.be.visible;
        });

        it('visible=null, should stay visible within 2 seconds of visible=true && important=true', function() {
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
