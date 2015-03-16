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

    describe('when receiving maybe message', function() {
        beforeEach(function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'maybe' }, {}, $.noop);
        });

        it('should be visible', function() {
            sidebarObj.should.be.visible;
        });
    });

    describe('when receiving maybenot message', function() {
        it('should be hidden if within 2 seconds of a maybe message', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'maybe' }, {}, $.noop);
            chrome.runtime.onMessage.addListener.yield({ msg: 'maybenot' }, {}, $.noop);
            sidebarObj.should.be.hidden;
        });

        it('should be visible if after 2 seconds of a maybe message', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'maybe' }, {}, $.noop);
            clock.tick(2000);
            chrome.runtime.onMessage.addListener.yield({ msg: 'maybenot' }, {}, $.noop);
            sidebarObj.should.be.visible;
        });

        it('should be visible if after on message', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'on' }, {}, $.noop);
            chrome.runtime.onMessage.addListener.yield({ msg: 'maybenot' }, {}, $.noop);
            sidebarObj.should.be.visible;
        });
    });

    describe('when receiving on message', function() {
        beforeEach(function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'on' }, {}, $.noop);
        });

        it('should be visible', function() {
            sidebarObj.should.be.visible;
        });
    });
});
