'use strict';

(function() {
    /* global putButtonIn */
    describe('putButtonIn', function() {
        describe('button', function() {
            it('should be in the element', function() {
                putButtonIn('#sandbox');

                $('#sandbox > .deckard-button').should.exist;
            });

            it('should have a left and top of 0', function() {
                putButtonIn('#sandbox');

                $('#sandbox > .deckard-button').should.have.css('left', '0px');
                $('#sandbox > .deckard-button').should.have.css('top', '0px');
            });

            it('should have display block on element mouseenter', function() {
                putButtonIn('#sandbox');

                $('#sandbox').mouseenter();
                $('#sandbox > .deckard-button').should.have.css('display', 'block');
            });

            it('should have display none on element mouseleave', function() {
                putButtonIn('#sandbox');

                $('#sandbox').mouseenter();
                $('#sandbox').mouseleave();
                $('#sandbox > .deckard-button').should.have.css('display', 'none');
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
        });
    });
})();
