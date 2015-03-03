/* global $, describe, it, afterEach */
/*jshint expr:true */
'use strict';

(function() {
    /* global putButtonOn */
    describe('putButtonOn', function() {
        describe('embed', function() {
            it('should be on youtube https embeds', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');

                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button').should.exist;
                $('#sandbox > .deckard-button + embed').should.exist;
            });

            it('should be on youtube http embeds', function() {
                $('#sandbox').append('<embed src="http://www.youtube.com/v/VpXUIh7rlWI">');

                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button').should.exist;
                $('#sandbox > .deckard-button + embed').should.exist;
            });

            it('should be on youtube embeds without "www"', function() {
                $('#sandbox').append('<embed src="https://youtube.com/v/VpXUIh7rlWI">');

                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button').should.exist;
                $('#sandbox > .deckard-button + embed').should.exist;
            });

            it('should be on youtube relative protocol embeds', function() {
                $('#sandbox').append('<embed src="//www.youtube.com/v/VpXUIh7rlWI">');

                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button').should.exist;
                $('#sandbox > .deckard-button + embed').should.exist;
            });

            it('should not put a button on other embeds', function() {
                $('#sandbox').append('<embed>');

                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button').should.not.exist;
            });
        });

        describe('object', function() {
            it('should be on youtube https objects', function() {
                $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');

                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button').should.exist;
                $('#sandbox > .deckard-button + object').should.exist;
            });

            it('should be on youtube http objects', function() {
                $('#sandbox').append('<object data="http://www.youtube.com/v/VpXUIh7rlWI"></object>');

                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button').should.exist;
                $('#sandbox > .deckard-button + object').should.exist;
            });

            it('should be on youtube objects without "www"', function() {
                $('#sandbox').append('<object data="https://youtube.com/v/VpXUIh7rlWI"></object>');

                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button').should.exist;
                $('#sandbox > .deckard-button + object').should.exist;
            });

            it('should be on youtube relative protocol objects', function() {
                $('#sandbox').append('<object data="//www.youtube.com/v/VpXUIh7rlWI"></object>');

                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button').should.exist;
                $('#sandbox > .deckard-button + object').should.exist;
            });

            it('shouldn\'t be on non-youtube objects', function() {
                $('#sandbox').append('<object></object>');

                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button').should.not.exist;
            });
        });

        describe('button', function() {
            it('should be at the same position as the element', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');

                putButtonOn('#sandbox');

                $('#sandbox > .deckard-button').offset().left.should.equal($('#sandbox > embed').offset().left);
                $('#sandbox > .deckard-button').offset().top.should.equal($('#sandbox > embed').offset().top);
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
        });
    });
})();
