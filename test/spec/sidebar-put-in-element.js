'use strict';

(function() {
    /* global sidebar */
    describe('sidebar-put-in-element', function() {
        describe('appearance', function() {
            it('should have class deckard-youtube-button', function() {
                sidebar.putInElement('#sandbox').should.have.class('deckard-sidebar');
            });

            it('should be in the element', function() {
                sidebar.putInElement('#sandbox');

                $('#sandbox > .deckard-sidebar').should.exist;
            });

            it('should be hidden', function() {
                sidebar.putInElement('#sandbox').should.be.hidden;
            });

            it('should contain an iframe with sidebar.html', function() {
                sandbox.stub(chrome.extension, 'getURL').returns('chrome://gibberish_id/sidebar.html');
                var sidebarObj = sidebar.putInElement('#sandbox');
                sidebarObj.should.have.descendants('iframe');
                chrome.extension.getURL.should.have.been.calledWith('sidebar.html');
                sidebarObj.children('iframe').should.have.prop('src', 'chrome://gibberish_id/sidebar.html');
            });
        });

        var sandbox;

        before(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
})();
