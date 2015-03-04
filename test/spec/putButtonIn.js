'use strict';

(function() {
    /* global putButtonIn */
    describe('putButtonIn', function() {
        describe('button', function() {
            it('should be in the element', function() {
                putButtonIn('#sandbox');

                $('#sandbox > .deckard-button')
                    .should.exist;
            });

            it('should have a left and top of 0', function() {
                putButtonIn('#sandbox');

                $('#sandbox > .deckard-button').position()
                    .should.deep.equal({ top: 0, left: 0 });
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
        });
    });
})();
