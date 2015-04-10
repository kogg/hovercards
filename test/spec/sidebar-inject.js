'use strict';

describe('sidebar-inject', function() {
    var sandbox = sinon.sandbox.create();
    var container, body, html;
    var sidebarObj;

    beforeEach(function(done) {
        require(['sidebar-inject'], function(sidebar_inject) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.stub(chrome.storage.sync, 'get');
            sandbox.stub(chrome.storage.sync, 'set');
            chrome.storage.sync.get.yields({ });
            container = $('<div id="container"></div>');
            body = $('<div id="body"></div>');
            html = $('<div id="html"></div>');
            sidebarObj = sidebar_inject.on(container, body, html);
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
        container.remove();
        body.remove();
        html.remove();
    });

    it('should be hidden', function() {
        expect(sidebarObj).to.have.css('display', 'none');
    });

    it('should contain an iframe with correct src', function() {
        expect(sidebarObj.children('iframe')).to.have.prop('src', 'chrome-extension://extension_id/sidebar.html');
    });

    it('should send hide on double click', function() {
        html.dblclick();
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

    describe('on load', function() {
        it('should be visible on load', function() {
            sidebarObj.css('display', 'none');
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });
            expect(sidebarObj).to.not.have.css('display', 'none');
        });

        it('should send loaded', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });

            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'loaded' });
        });
    });

    describe('on hide', function() {
        it('should be hidden on hide', function() {
            // sidebarObj.css('display', '');
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            expect(sidebarObj).to.have.css('display', 'none');
        });

        it('should send hidden', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });

            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'hidden' });
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
});
