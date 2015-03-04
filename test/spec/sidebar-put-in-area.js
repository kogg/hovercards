'use strict';

(function() {
    /* global sidebar */
    describe('sidebar-put-in-area', function() {
        describe('appearance', function() {
            it('should have class deckard-youtube-button', function() {
                sidebar.putInArea('#sandbox').should.have.class('deckard-sidebar');
            });
        });
    });
})();
