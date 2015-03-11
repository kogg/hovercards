'use strict';

// FIXME These tests in phantomJS because the iframe loading gets cancelled
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

    describe('when receiving display message', function() {
        it('= stay_visible, should stay visible', function() {
            var clock = sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', key: 'display', value: 'stay_visible' }, {}, $.noop);
            sidebarObj.should.be.visible;
            clock.tick(2000);
            sidebarObj.should.be.visible;
        });

        it('= stay_visible, should have src', function() {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', key: 'display', value: 'stay_visible' }, {}, $.noop);
            sidebarObj.children('iframe').should.have.prop('src', 'chrome://extension_id/sidebar.html');
        });

        it('= visible, should be visible', function() {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', key: 'display', value: 'visible' }, {}, $.noop);
            sidebarObj.should.be.visible;
            sidebarObj.children('iframe').should.have.prop('src', 'chrome://extension_id/sidebar.html');
        });

        it('= visible, should have src', function() {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', key: 'display', value: 'visible' }, {}, $.noop);
            sidebarObj.should.be.visible;
        });

        it('= unconcerned, should be hidden within 2 seconds of "visible"', function() {
            var clock = sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', key: 'display', value: 'visible' }, {}, $.noop);
            clock.tick(1999);
            sidebarObj.should.be.visible;
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', key: 'display', value: 'unconcerned' }, {}, $.noop);
            sidebarObj.should.be.hidden;
        });

        it('= unconcerned, should stay visible after 2 seconds of "visible"', function() {
            var clock = sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            var sidebarObj = sidebar().appendTo('#sandbox');
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', key: 'display', value: 'visible' }, {}, $.noop);
            clock.tick(2000);
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', key: 'display', value: 'unconcerned' }, {}, $.noop);
            sidebarObj.should.be.visible;
        });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
