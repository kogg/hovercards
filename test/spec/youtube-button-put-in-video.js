'use strict';

(function() {
    /* global youtubeButton */
    describe('youtube-button-put-in-video', function() {
        describe('button', function() {
            it('should be in the element', function() {
                youtubeButton.putInVideo('#sandbox');

                $('#sandbox > .deckard-button').should.exist;
            });

            it('should be at the same position as the element', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
                youtubeButton.putInVideo('#sandbox');

                $('#sandbox > .deckard-button').offset().should.deep.equal($('#sandbox > embed').offset());
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
