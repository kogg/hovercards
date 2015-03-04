'use strict';

(function() {
    /* global youtubeButton */
    describe('youtube-button-build', function() {
        it('should have class deckard-button', function() {
            youtubeButton.build('#video').appendTo('#sandbox').should.have.class('deckard-button');
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

            chrome.runtime.sendMessage.should.have.been.calledWith({ cmd: 'load_html', filename: 'button.html' });
            button.should.have.html('Button Content');
        });

        describe('hovering', function() {
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

            it('should still be opaque 1 second after mouseenter', function() {
                this.clock = sandbox.useFakeTimers();
                var button = youtubeButton.build('#video').appendTo('#sandbox');

                button.mouseenter();
                this.clock.tick(1000);
                button.should.have.css('opacity', '1');
            });
        });

        describe('video hovering', function() {
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

            it('should be transparent 1 second after video mouseenter', function() {
                this.clock = sandbox.useFakeTimers();
                var button = youtubeButton.build('#video').appendTo('#sandbox');

                $('#video').mouseenter();
                this.clock.tick(1000);
                button.should.have.css('opacity', '0');
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
