'use strict';

describe('youtube-button-put-in-video', function() {
    var sandbox, youtubeButton;

    before(function(done) {
        require(['youtube-button', 'sinon'], function(_youtubeButton, sinon) {
            youtubeButton = _youtubeButton;
            sandbox = sinon.sandbox.create();
            done();
        });
    });

    describe('button position', function() {
        it('should be in the element', function() {
            youtubeButton.putInVideo('#sandbox');

            $('#sandbox > .deckard-youtube-button').should.exist;
        });

        it('should be built using the video contents', function() {
            sandbox.stub(youtubeButton, 'build');
            youtubeButton.putInVideo('#sandbox');

            youtubeButton.build.should.have.been.calledWith('#player');
        });

        it('should be at the same position as the element', function() {
            $('#sandbox').append('<div id="player"></div>');
            youtubeButton.putInVideo('#sandbox');

            $('#sandbox > .deckard-youtube-button').offset().should.deep.equal($('#sandbox > #player').offset());
        });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
