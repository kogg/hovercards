'use strict';

describe('youtube-button-put-on-videos', function() {
    var sandbox, youtubeButton;

    before(function(done) {
        sandbox = sinon.sandbox.create();
        require(['youtube-button'], function(_youtubeButton) {
            youtubeButton = _youtubeButton;
            done();
        });
    });

    describe('embed', function() {
        it('should be on youtube embeds', function() {
            $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
            youtubeButton.putOnVideos('#sandbox');

            $('#sandbox > .deckard-youtube-button').should.exist;
            $('#sandbox > .deckard-youtube-button + embed').should.exist;
        });

        it('should not put a button on other embeds', function() {
            $('#sandbox').append('<embed>');
            youtubeButton.putOnVideos('#sandbox');

            $('#sandbox > .deckard-youtube-button').should.not.exist;
        });
    });

    describe('object', function() {
        it('should be on youtube objects', function() {
            $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');
            youtubeButton.putOnVideos('#sandbox');

            $('#sandbox > .deckard-youtube-button').should.exist;
            $('#sandbox > .deckard-youtube-button + object').should.exist;
        });

        it('shouldn\'t be on non-youtube objects', function() {
            $('#sandbox').append('<object></object>');
            youtubeButton.putOnVideos('#sandbox');

            $('#sandbox > .deckard-youtube-button').should.not.exist;
        });
    });

    describe('button position', function() {
        it('should be at the same position as the element', function() {
            $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
            youtubeButton.putOnVideos('#sandbox');

            $('#sandbox > .deckard-youtube-button').offset().should.deep.equal($('#sandbox > embed').offset());
        });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
