'use strict';

/* PhantomJS can't handle the iframe with a src, since it doesn't actually load something legit */
(navigator.userAgent.indexOf('PhantomJS') < 0 ? describe : describe.skip)
('sidebar', function() {
    var sandbox = sinon.sandbox.create();
    var clock;
    var sidebarObj;

    beforeEach(function(done) {
        $('<div id="sandbox"></div>').appendTo('body');
        require(['sidebar'], function(sidebar) {
            clock = sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebarObj = sidebar().appendTo('#sandbox');
            done();
        });
    });

    afterEach(function() {
        $('#sandbox').remove();
        sandbox.restore();
    });

    it('should be hidden', function() {
        sidebarObj.should.be.hidden;
    });

    it('should contain an iframe with correct src', function() {
        sidebarObj.children('iframe').should.have.prop('src', 'chrome-extension://extension_id/sidebar.html');
    });

    describe('when receiving sidebar message', function() {
        it('should be visible if visible=true', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true }, {}, $.noop);
            sidebarObj.should.be.visible;
        });

        it('should be hidden within 2 seconds of visible=true if visible=null', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true }, {}, $.noop);
            clock.tick(1999);
            sidebarObj.should.be.visible;
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: null }, {}, $.noop);
            sidebarObj.should.be.hidden;
        });

        it('should stay visible after 2 seconds of visible=true if visible=null', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true }, {}, $.noop);
            clock.tick(2000);
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: null }, {}, $.noop);
            sidebarObj.should.be.visible;
        });

        it('should stay visible within 2 seconds of visible=true && important=true if visible=null', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: true, important: true }, {}, $.noop);
            clock.tick(1999);
            sidebarObj.should.be.visible;
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', visible: null }, {}, $.noop);
            sidebarObj.should.be.visible;
        });
    });
});
