'use strict';

describe('sidebar-inject', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var sidebarObj;

    beforeEach(function(done) {
        require(['sidebar-inject'], function(sidebarInject) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.stub(chrome.storage.sync, 'get');
            sandbox.stub(chrome.storage.sync, 'set');
            chrome.storage.sync.get.yields({ });
            body = $('<div id="sandbox"></div>');
            sidebarObj = sidebarInject.on(body, body);
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    it('should be hidden', function() {
        expect(sidebarObj).to.have.css('display', 'none');
    });

    it('should contain an iframe with correct src', function() {
        expect(sidebarObj.children('iframe')).to.have.prop('src', 'chrome-extension://extension_id/sidebar.html');
    });

    it('should send hide on double click', function() {
        body.dblclick();
        expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'hide' });
    });

    describe('scroll behavior', function() {
        it('should give body overflow:hidden on iframe:mouseenter', function() {
            sidebarObj.children('iframe').mouseenter();
            expect(body).to.have.css('overflow', 'hidden');
        });

        it('should remove body overflow:hidden on iframe:mouseleave', function() {
            body.css('overflow', 'hidden');
            sidebarObj.children('iframe').mouseleave();
            expect(body).to.not.have.css('overflow', 'hidden');
        });
    });

    describe('on load/hide', function() {
        it('should be visible on load', function() {
            sidebarObj.css('display', 'none');
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });
            expect(sidebarObj).to.not.have.css('display', 'none');
        });

        it('should be hidden on hide', function() {
            // sidebarObj.css('display', '');
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            expect(sidebarObj).to.have.css('display', 'none');
        });

        it('should send notify:firsthide on hide', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'notify', type: 'firsthide' });
        });
    });

    describe('close button', function() {
        var closeButton;

        beforeEach(function() {
            closeButton = sidebarObj.children('div.hovercards-sidebar-close-button');
        });

        it('should exist', function() {
            expect(closeButton).to.exist;
        });

        it('should send hide on click', function() {
            closeButton.trigger($.Event('click', { which: 1 }));
            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'hide' });
        });

        it('should not send hide on right click', function() {
            closeButton.trigger($.Event('click', { which: 2 }));
            expect(chrome.runtime.sendMessage).to.not.have.been.calledWith({ msg: 'hide' });
        });
    });

    describe('firstload', function() {
        it('should send notify:firstload on load', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });

            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'notify', type: 'firstload' });
        });

        it('should not send notify:firstload on load * 2', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });
            var callCount = chrome.runtime.sendMessage.withArgs({ msg: 'notify', type: 'firstload' }).callCount;
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });

            expect(chrome.runtime.sendMessage.withArgs({ msg: 'notify', type: 'firstload' }).callCount).to.equal(callCount);
        });

        it('should not send notify:firstload on load if sync intro === true', function() {
            chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });

            expect(chrome.runtime.sendMessage).not.to.have.been.calledWith({ msg: 'notify', type: 'firstload' });
        });
    });

    describe('firsthide', function() {
        it('should send notify:firsthide on hide', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });

            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'notify', type: 'firsthide' });
        });

        it('should not send notify:firsthide on hide * 2', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            var callCount = chrome.runtime.sendMessage.withArgs({ msg: 'notify', type: 'firsthide' }).callCount;
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });

            expect(chrome.runtime.sendMessage.withArgs({ msg: 'notify', type: 'firsthide' }).callCount).to.equal(callCount);
        });

        it('should not send notify:firsthide on hide if sync intro === true', function() {
            chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });

            expect(chrome.runtime.sendMessage).not.to.have.been.calledWith({ msg: 'notify', type: 'firsthide' });
        });
    });
});
