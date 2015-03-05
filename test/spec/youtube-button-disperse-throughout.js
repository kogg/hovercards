'use strict';

define(['youtube-button', 'jquery', 'sinon'], function(youtubeButton, $, sinon) {
    describe('youtube-button-disperse-throughout', function() {
        var sandbox = sinon.sandbox.create();
        var server;

        beforeEach(function() {
            server = sandbox.useFakeServer();
            server.respondWith('chrome://extension_id/button.html', 'Button Content');
        });

        describe('on embed', function() {
            it('should be on youtube embeds', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
                youtubeButton.disperseThroughout('#sandbox');

                $('#sandbox > .deckard-youtube-button').should.exist;
                $('#sandbox > .deckard-youtube-button + embed').should.exist;
            });

            it('should not put a button on other embeds', function() {
                $('#sandbox').append('<embed>');
                youtubeButton.disperseThroughout('#sandbox');

                $('#sandbox > .deckard-youtube-button').should.not.exist;
            });
        });

        describe('on object', function() {
            it('should be on youtube objects', function() {
                $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');
                youtubeButton.disperseThroughout('#sandbox');

                $('#sandbox > .deckard-youtube-button').should.exist;
                $('#sandbox > .deckard-youtube-button + object').should.exist;
            });

            it('shouldn\'t be on non-youtube objects', function() {
                $('#sandbox').append('<object></object>');
                youtubeButton.disperseThroughout('#sandbox');

                $('#sandbox > .deckard-youtube-button').should.not.exist;
            });
        });

        describe('button position', function() {
            it('should be at the same position as the element', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
                youtubeButton.disperseThroughout('#sandbox');

                $('#sandbox > .deckard-youtube-button').offset().should.deep.equal($('#sandbox > embed').offset());
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
});
