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
        });

        afterEach(function() {
            $('#sandbox').empty();
        });
    });
})();
