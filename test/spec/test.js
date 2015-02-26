/* global describe, it, $, beforeEach, afterEach */
/* global wrapElements */
/*jshint expr:true */

(function () {
    'use strict';

    describe('wrap_elements', function () {
        describe('default youtube wrapping', function () {
            beforeEach(function() {
                $('body').add('<iframe width="560" height="315" src="https://www.youtube.com/embed/VpXUIh7rlWI" frameborder="0" allowfullscreen></iframe>');
                wrapElements('body');
            });

            it('should wrap the element', function () {
                $('.deckard_extension').should.exist;
            });

            afterEach(function() {
                $('body').empty();
            });
        });
    });
})();
