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
            sandbox.stub(chrome.runtime, 'sendMessage')
                .yields('Button Content');
            var buttonObj = button('#sandbox').appendTo('#sandbox');

            chrome.runtime.sendMessage
                .should.have.been.calledWith({ cmd: 'load_html', fileName: 'button.html' });
            buttonObj
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

        var sandbox;

        before(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
})();
