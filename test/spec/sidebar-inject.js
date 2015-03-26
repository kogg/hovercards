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

    describe('call', function() {
        beforeEach(function() {
            sandbox.stub(sidebarInject, 'injectSidebar');
        });

        it('should register injectSidebar on default', function() {
            sidebarInject('default');
            sidebarInject.injectSidebar.should.have.been.called;
        });
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

        describe('on deck', function() {
            describe('then undeck', function() {
                it('should be visible if it was hidden ', function() {
                    sidebarObj.hide();
                    chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' });
                    chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
                    sidebarObj.should.not.be.css('display', 'none');
                });

                it('should be visible if it was visible', function() {
                    sidebarObj.show();
                    chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' });
                    chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
                    sidebarObj.should.not.be.css('display', 'none');
                });

                it('should be hidden if called twice', function() {
                    sidebarObj.show();
                    chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' });
                    chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
                    chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
                    sidebarObj.should.be.css('display', 'none');
                });

                it('should be visible if called thrice', function() {
                    sidebarObj.show();
                    chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' });
                    chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
                    chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
                    chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
                    sidebarObj.should.not.be.css('display', 'none');
                });
            });
        });

        describe('on undeck', function() {
            it('should be hidden if it was hidden', function() {
                sidebarObj.hide();
                chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
                sidebarObj.should.be.css('display', 'none');
            });

            it('should be hidden if it was visible', function() {
                sidebarObj.show();
                chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
                sidebarObj.should.be.css('display', 'none');
            });
        });
    });
});
