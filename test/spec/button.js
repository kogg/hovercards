'use strict';

(function() {
    /* global button */
    describe('button', function() {
        it('should have class deckard-button', function() {
            button('#video').appendTo('#sandbox')
                .should.have.class('deckard-button');
        });

        it('should be transparent', function() {
            button('#video').appendTo('#sandbox')
                .should.have.css('opacity', '0');
        });

        it('should have position absolute', function() {
            button('#video').appendTo('#sandbox')
                .should.have.css('position', 'absolute');
        });

        it('should load it\'s content', function() {
            sandbox.stub(chrome.runtime, 'sendMessage')
                .yields('Button Content');
            var buttonObj = button('#video').appendTo('#sandbox');

            chrome.runtime.sendMessage
                .should.have.been.calledWith({ cmd: 'load_html', fileName: 'button.html' });
            buttonObj
                .should.have.html('Button Content');
        });

        describe('hovering', function() {
            it('should be opaque on mouseenter', function() {
                button('#video').appendTo('#sandbox')
                    .mouseenter()
                    .should.have.css('opacity', '1');
            });

            it('should be transparent on mouseleave', function() {
                button('#video').appendTo('#sandbox')
                    .mouseenter()
                    .mouseleave()
                    .should.have.css('opacity', '0');
            });

            it('should still be opaque 1 second after mouseenter', function(done) {
                var buttonObj = button('#video').appendTo('#sandbox');

                buttonObj
                    .mouseenter();
                setTimeout(function() {
                    buttonObj
                        .should.have.css('opacity', '1');
                    done();
                }, 1000);
            });
        });

        describe('video hovering', function() {
            it('should be opaque on video mouseenter', function() {
                console.log('problem');
                var buttonObj = button('#video').appendTo('#sandbox');

                $('#video')
                    .mouseenter();
                buttonObj
                    .should.have.css('opacity', '1');
            });

            it('should be transparent on video mouseleave', function() {
                var buttonObj = button('#video').appendTo('#sandbox');

                $('#video')
                    .mouseenter()
                    .mouseleave();
                buttonObj
                    .should.have.css('opacity', '0');
            });

            it('should be transparent 1 second after video mouseenter', function(done) {
                var buttonObj = button('#video').appendTo('#sandbox');

                $('#video')
                    .mouseenter();
                setTimeout(function() {
                    buttonObj
                        .should.have.css('opacity', '0');
                    done();
                }, 1000);
            });
        });

        var sandbox;

        before(function() {
            sandbox = sinon.sandbox.create();
        });

        beforeEach(function() {
            $('#sandbox').append('<div id="video"></div>');
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
})();
