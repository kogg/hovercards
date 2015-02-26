/* global describe, it, $, beforeEach, afterEach */
/* global wrapElements */
/*jshint expr:true */

(function () {
    'use strict';

    describe('wrap_elements', function () {
        describe('default youtube wrapping', function () {
            beforeEach(function() {
                $('body').add('<iframe id="youtube_video" width="560" height="315" src="https://www.youtube.com/embed/VpXUIh7rlWI" frameborder="0" allowfullscreen></iframe>');
                wrapElements('body');
            });

            it('should wrap the element', function () {
                $('.deckard_extension').should.exist;
                $('.deckard_extension').should.have.descendents('iframe#youtube_video');
            });

            afterEach(function() {
                $('body').empty();
            });
        });
    });
})();
