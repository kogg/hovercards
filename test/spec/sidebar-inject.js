'use strict';

describe('sidebar-inject', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var sidebarInject;

    beforeEach(function(done) {
        require(['sidebar-inject'], function(_sidebarInject) {
            sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebarInject = _sidebarInject;
            done();
        });
    });

    beforeEach(function() {
        body = $('<div id="sandbox"></div>');
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should call injectSidebar on default', function() {
        sandbox.stub(sidebarInject, 'injectSidebar');
        sidebarInject('default');
        sidebarInject.injectSidebar.should.have.been.called;
    });

    describe('#injectSidebar', function() {
        var sidebarObj;

        beforeEach(function() {
            sidebarObj = sidebarInject.injectSidebar(body);
        });

        it('should be hidden', function() {
            sidebarObj.should.be.css('display', 'none');
        });

        it('should contain an iframe with correct src', function() {
            sidebarObj.children('iframe').should.have.prop('src', 'chrome-extension://extension_id/sidebar.html');
        });

        it('should be visible on load', function() {
            sidebarObj.hide();
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', content: 'something', id: 'SOME_ID' });
            sidebarObj.should.not.be.css('display', 'none');
        });

        it('should be visible on show', function() {
            sidebarObj.hide();
            chrome.runtime.onMessage.addListener.yield({ msg: 'show' });
            sidebarObj.should.not.be.css('display', 'none');
        });

        it('should be hidden on hide', function() {
            sidebarObj.show();
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            sidebarObj.should.be.css('display', 'none');
        });
    });
});
