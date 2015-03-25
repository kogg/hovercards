'use strict';

describe('sidebar (injections)', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var sidebar;

    beforeEach(function(done) {
        require(['sidebar'], function(_sidebar) {
            sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sidebar = _sidebar;
            done();
        });
    });

    beforeEach(function() {
        body = $('<div id="sandbox"></div>');
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('#inject', function() {
        beforeEach(function() {
            sandbox.stub(sidebar, 'injectSidebar');
        });

        it('should register injectSidebar on default', function() {
            sidebar.inject('default');
            sidebar.injectSidebar.should.have.been.called;
        });
    });

    describe('#injectSidebar', function() {
        var sidebarObj;

        beforeEach(function() {
            sidebarObj = sidebar.injectSidebar(body);
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
