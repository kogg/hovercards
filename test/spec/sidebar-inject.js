var $ = require('jquery');

describe('sidebar-inject', function() {
    var sandbox = sinon.sandbox.create();
    var container, body, html;
    var sidebarObj;
    var spy;

    beforeEach(function() {
        container = $('<div id="container"></div>');
        body = $('<div id="body"></div>');
        html = $('<div id="html"></div>');
        sidebarObj = require('./scripts/sidebar-inject')(container, body, html, spy = sandbox.spy());
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
        expect(spy).to.have.been.calledWith({ msg: 'hide' });
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
            sidebarObj.trigger('sidebar.msg', [{ msg: 'load', url: 'URL' }]);

            expect(sidebarObj).to.not.have.css('display', 'none');
        });

        it('should send loaded', function() {
            sidebarObj.trigger('sidebar.msg', [{ msg: 'load', url: 'URL' }]);

            expect(spy).to.have.been.calledWith({ msg: 'loaded' });
        });
    });

    describe('on hide', function() {
        it('should be hidden on hide', function() {
            // sidebarObj.css('display', '');
            sidebarObj.trigger('sidebar.msg', [{ msg: 'hide' }]);

            expect(sidebarObj).to.have.css('display', 'none');
        });

        it('should send hidden', function() {
            sidebarObj.trigger('sidebar.msg', [{ msg: 'hide' }]);

            expect(spy).to.have.been.calledWith({ msg: 'hidden' });
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
            expect(spy).to.have.been.calledWith({ msg: 'hide' });
        });

        it('should not send hide on right click', function() {
            closeButton.trigger($.Event('click', { which: 2 }));
            expect(spy).to.not.have.been.calledWith({ msg: 'hide' });
        });
    });
});
