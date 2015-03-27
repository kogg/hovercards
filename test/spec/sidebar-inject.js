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
        expect(sidebarInject.injectSidebar).to.have.been.called;
    });

    describe('#injectSidebar', function() {
        var sidebarObj;

        beforeEach(function() {
            sidebarObj = sidebarInject.injectSidebar(body);
        });

        it('should be hidden', function() {
            expect(sidebarObj).to.have.css('display', 'none');
        });

        it('should contain an iframe with correct src', function() {
            expect(sidebarObj.children('iframe')).to.have.prop('src', 'chrome-extension://extension_id/sidebar.html');
        });

        describe('on load/show/hide', function() {
            it('should be visible on load', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'load', content: 'something', id: 'SOME_ID' });
                expect(sidebarObj).to.not.have.css('display', 'none');
            });

            it('should be visible on show', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'show' });
                expect(sidebarObj).to.not.have.css('display', 'none');
            });

            it('should be hidden on hide', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
                expect(sidebarObj).to.have.css('display', 'none');
            });
        });
    });
});
