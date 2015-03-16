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
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', show: 'maybe' }, {});
        });

        it('should be visible', function() {
            sidebarObj.should.be.visible;
        });

        it('should be hidden if followed by maybenot message within 2 seconds', function() {
            clock.tick(1999);
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', show: 'maybenot' }, {});
            sidebarObj.should.be.hidden;
        });

        it('should be visible if followed by maybenot message after 2 seconds', function() {
            clock.tick(2000);
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', show: 'maybenot' }, {});
            sidebarObj.should.be.visible;
        });
    });

    describe('when receiving on message', function() {
        beforeEach(function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', show: 'on' }, {});
        });

        it('should be visible', function() {
            sidebarObj.should.be.visible;
        });

        it('should be visible if followed by maybenot message', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', show: 'maybenot' }, {});
            sidebarObj.should.be.visible;
        });
    });
});
