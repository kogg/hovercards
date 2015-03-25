'use strict';

/* PhantomJS can't handle the iframe with a src, since it doesn't actually load something legit */
describe('sidebar', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var injector;
    var sidebar;

    beforeEach(function(done) {
        require(['Squire'], function(Squire) {
            new Squire()
                .mock('injector', injector = {})
                .require(['sidebar'], function(_sidebar) {
                    sandbox.useFakeTimers();
                    sandbox.stub(chrome.runtime.onMessage, 'addListener');
                    sidebar = _sidebar;
                    done();
                });
        });
    });

    beforeEach(function() {
        body = $('<div id="sandbox"></div>');
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('#registerInjections', function() {
        beforeEach(function() {
            injector.register = sandbox.stub();
            sidebar.registerInjections();
        });

        it('should register injectSidebar on default', function() {
            injector.register.should.have.been.calledWith('default', sidebar.injectSidebar);
        });
    });

    describe('#injectSidebar', function() {
        var sidebarObj;

        beforeEach(function() {
            sidebarObj = sidebar.injectSidebar(body);
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
                sidebarObj.should.not.be.css('display', 'none');
            });

            it('should be hidden if followed by maybenot message within 2 seconds', function() {
                sandbox.clock.tick(1999);
                chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', show: 'maybenot' }, {});
                sidebarObj.should.be.css('display', 'none');
            });

            it('should be visible if followed by maybenot message after 2 seconds', function() {
                sandbox.clock.tick(2000);
                chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', show: 'maybenot' }, {});
                sidebarObj.should.not.be.css('display', 'none');
            });
        });

        describe('when receiving on message', function() {
            beforeEach(function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', show: 'on' }, {});
            });

            it('should be visible', function() {
                sidebarObj.should.not.be.css('display', 'none');
            });

            it('should be visible if followed by maybenot message', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', show: 'maybenot' }, {});
                sidebarObj.should.not.be.css('display', 'none');
            });
        });
    });
});
