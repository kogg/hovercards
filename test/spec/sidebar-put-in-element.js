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
