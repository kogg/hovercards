'use strict';

(function() {
    /* global button */
    describe('button', function() {
        it('should have class deckard-button', function() {
            button('#sandbox').appendTo('#sandbox')
                .should.have.class('deckard-button');
        });

        it('should have display none', function() {
            button('#sandbox').appendTo('#sandbox')
                .should.have.css('display', 'none');
        });

        it('should have position absolute', function() {
            button('#sandbox').appendTo('#sandbox')
                .should.have.css('position', 'absolute');
        });

        it('should load it\'s content', function() {
            chrome.runtime.sendMessage = function(message, callback) {
                message.cmd.should.equal('load_html');
                message.fileName.should.equal('button.html');
                callback('Button Content');
            };

            button('#sandbox').appendTo('#sandbox')
                .should.have.html('Button Content');
        });

        it('should have display block on mouseenter', function() {
            button('#sandbox').appendTo('#sandbox')
                .mouseenter()
                .should.have.css('display', 'block');
        });

        it('should have display none on mouseleave', function() {
            button('#sandbox').appendTo('#sandbox')
                .mouseenter()
                .mouseleave()
                .should.have.css('display', 'none');
        });

        it('should have display block on element mouseenter', function() {
            var buttonObj = button('#sandbox').appendTo('#sandbox');

            $('#sandbox')
                .mouseenter();
            buttonObj
                .should.have.css('display', 'block');
        });

        it('should have display none on element mouseleave', function() {
            var buttonObj = button('#sandbox').appendTo('#sandbox');

            $('#sandbox')
                .mouseenter()
                .mouseleave();
            buttonObj
                .should.have.css('display', 'none');
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
        });
    });
})();
