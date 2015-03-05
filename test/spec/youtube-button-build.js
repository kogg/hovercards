'use strict';

(function() {
    /* global youtubeButton */
    describe('youtube-button-build', function() {
        describe('appearance', function() {
            it('should have class deckard-youtube-button', function() {
                youtubeButton.build('#video').appendTo('#sandbox').should.have.class('deckard-youtube-button');
            });

            it('should be transparent', function() {
                youtubeButton.build('#video').appendTo('#sandbox').should.have.css('opacity', '0');
            });

            it('should have position absolute', function() {
                youtubeButton.build('#video').appendTo('#sandbox').should.have.css('position', 'absolute');
            });

            it('should load it\'s content', function() {
                sandbox.stub(chrome.runtime, 'sendMessage').yields('Button Content');
                var button = youtubeButton.build('#video').appendTo('#sandbox');

                chrome.runtime.sendMessage.should.have.been.calledWith({ cmd: 'load-html', filename: 'button.html' });
                button.should.have.html('Button Content');
            });
        });

        describe('opacity', function() {
            it('should be opaque on mouseenter', function() {
                var button = youtubeButton.build('#video').appendTo('#sandbox');

                button.mouseenter();
                button.should.have.css('opacity', '1');
            });

            it('should be transparent on mouseleave', function() {
                var button = youtubeButton.build('#video').appendTo('#sandbox');

                button.mouseenter();
                button.mouseleave();
                button.should.have.css('opacity', '0');
            });

            it('should still be opaque 2 seconds after mouseenter', function() {
                this.clock = sandbox.useFakeTimers();
                var button = youtubeButton.build('#video').appendTo('#sandbox');

                button.mouseenter();
                this.clock.tick(2000);
                button.should.have.css('opacity', '1');
                $('#sandbox > .deckard-youtube-button:animated').should.not.exist;
            });

            it('should be opaque on video mouseenter', function() {
                var button = youtubeButton.build('#video').appendTo('#sandbox');

                $('#video').mouseenter();
                button.should.have.css('opacity', '1');
            });

            it('should be transparent on video mouseleave', function() {
                var button = youtubeButton.build('#video').appendTo('#sandbox');

                $('#video').mouseenter();
                $('#video').mouseleave();
                button.should.have.css('opacity', '0');
            });

            it('should fade out starting 2 seconds after video mouseenter', function() {
                this.clock = sandbox.useFakeTimers();
                var button = youtubeButton.build('#video').appendTo('#sandbox');

                $('#video').mouseenter();
                this.clock.tick(2000);
                button.should.have.css('opacity', '1');
                $('#sandbox > .deckard-youtube-button:animated').should.exist;
                // TODO Detect that the animation is the one we want
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
