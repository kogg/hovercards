/* global $, describe, it, afterEach */
/*jshint expr:true */
'use strict';

(function() {
    /* global putButtonIn */
    describe('putButtonIn', function() {
        describe('button', function() {
            it('should be in the element', function() {
                putButtonIn('#sandbox');

                $('#sandbox > .deckard-button').should.exist;
            });

            it('should have a left and top of 0');
            it('should have content');
        });

        afterEach(function() {
            $('sandbox').empty();
        });
    });
})();
