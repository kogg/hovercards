'use strict';

(function() {
    /* global button */
    describe('button', function() {
        it('should have class deckard-button', function() {
            $('#sandbox').append(button('#sandbox'));

            $('#sandbox > .deckard-button').should.exist;
        });

        it('should have display none', function() {
            $('#sandbox').append(button('#sandbox'));

            $('#sandbox > .deckard-button').should.have.css('display', 'none');
        });

        it('should have position absolute', function() {
            $('#sandbox').append(button('#sandbox'));

            $('#sandbox > .deckard-button').should.have.css('position', 'absolute');
        });

        it('should load it\'s content', function() {
            chrome.runtime.sendMessage = function(message, callback) {
                message.cmd.should.equal('load_html');
                message.fileName.should.equal('button.html');
                callback('Button Content');
            };

            $('#sandbox').append(button('#sandbox'));

            $('#sandbox > div.deckard-button').should.have.html('Button Content');
        });

        it('should have display block on mouseenter', function() {
            $('#sandbox').append(button('#sandbox'));

            $('#sandbox > .deckard-button').mouseenter();
            $('#sandbox > .deckard-button').should.have.css('display', 'block');
        });

        it('should have display none on mouseleave', function() {
            $('#sandbox').append(button('#sandbox'));

            $('#sandbox > .deckard-button').mouseenter();
            $('#sandbox > .deckard-button').mouseleave();
            $('#sandbox > .deckard-button').should.have.css('display', 'none');
        });

        it('should have display block on element mouseenter', function() {
            $('#sandbox').append(button('#sandbox'));

            $('#sandbox').mouseenter();
            $('#sandbox > .deckard-button').should.have.css('display', 'block');
        });

        it('should have display none on element mouseleave', function() {
            $('#sandbox').append(button('#sandbox'));

            $('#sandbox').mouseenter();
            $('#sandbox').mouseleave();
            $('#sandbox > .deckard-button').should.have.css('display', 'none');
        });

        afterEach(function() {
            $('#sandbox').empty();
        });
    });
})();
