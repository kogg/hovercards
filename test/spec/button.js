/* global $, describe, it, afterEach */
/*jshint expr:true */
'use strict';

(function() {
    /* global button */
    describe('button', function() {
        it('should have class deckard-button', function() {
            $('#sandbox').append(button());
            $('#sandbox > .deckard-button').should.exist;
        });

        it('should have position absolute', function() {
            $('#sandbox').append(button());
            $('#sandbox > .deckard-button').should.have.css('position', 'absolute');
        });

        it('should load it\'s content');

        afterEach(function() {
            $('#sandbox').empty();
        });
    });
})();
