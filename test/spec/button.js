/* global $, describe, it, afterEach */
/*jshint expr:true */
'use strict';

(function() {
    /* global button */
    describe('button', function() {
        it('should have class deckard-button', function() {
            button().should.have.class('deckard-button');
        });

        it('should have position absolute');
        it('should load it\'s content');

        afterEach(function() {
            $('#sandbox').empty();
        });
    });
})();
