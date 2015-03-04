'use strict';

(function() {
    /* global putButtonOn */
    describe('putButtonOn', function() {
        describe('embed', function() {
            it('should be on youtube embeds', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button')
                    .should.exist;
                $('#sandbox > .deckard-button + embed')
                    .should.exist;
            });

            it('should not put a button on other embeds', function() {
                $('#sandbox').append('<embed>');
                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button')
                    .should.not.exist;
            });
        });

        describe('object', function() {
            it('should be on youtube objects', function() {
                $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');
                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button')
                    .should.exist;
                $('#sandbox > .deckard-button + object')
                    .should.exist;
            });

            it('shouldn\'t be on non-youtube objects', function() {
                $('#sandbox').append('<object></object>');
                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button')
                    .should.not.exist;
            });
        });

        describe('button', function() {
            it('should be at the same position as the element on mouseenter', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
                putButtonOn('#sandbox');

                $('#sandbox > embed')
                    .mouseenter();
                $('#sandbox > .deckard-button').offset()
                    .should.deep.equal($('#sandbox > embed').offset());
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
        });
    });
})();
