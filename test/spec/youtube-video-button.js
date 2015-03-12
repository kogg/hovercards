'use strict';

describe('youtube-video-button', function() {
    var sandbox = sinon.sandbox.create();
    var youtubeVideoButton;

    beforeEach(function(done) {
        $('#sandbox').append('<div id="video"></div>');
        require(['Squire'], function(Squire) {
            var injector = new Squire();
            injector.require(['youtube-video-button'], function(_youtubeVideoButton) {
                youtubeVideoButton = _youtubeVideoButton;
                done();
            });
        });
    });

    it('should be transparent', function() {
        youtubeVideoButton('#video', 'VIDEO_ID').appendTo('#sandbox').should.have.css('opacity', '0');
    });

    it('should have position absolute', function() {
        youtubeVideoButton('#video', 'VIDEO_ID').appendTo('#sandbox').should.have.css('position', 'absolute');
    });

    it('should have inner content', function() {
        youtubeVideoButton('#video', 'VIDEO_ID').appendTo('#sandbox').should.have.descendants('div');
    });

    describe('when mouseenter', function() {
        it('should be opaque', function() {
            youtubeVideoButton('#video', 'VIDEO_ID').appendTo('#sandbox').mouseenter().should.have.css('opacity', '1');
        });

        it('should be at the video\'s position', function() {
            var button = youtubeVideoButton('#video', 'VIDEO_ID').appendTo('#sandbox');
            $('#video').offset({ top: 10, left: 11 });
            button.mouseenter().offset().should.deep.equal($('#video').offset());
        });
    });

    describe('when mouseleave', function() {
        it('should be transparent', function() {
            youtubeVideoButton('#video', 'VIDEO_ID').appendTo('#sandbox').mouseenter().mouseleave().should.have.css('opacity', '0');
        });
    });

    describe('when video mouseenter', function() {
        it('should be opaque', function() {
            var button = youtubeVideoButton('#video', 'VIDEO_ID').appendTo('#sandbox');
            $('#video').mouseenter();
            button.should.have.css('opacity', '1');
        });

        it('should fade out starting 2 seconds after', function() {
            var clock = sandbox.useFakeTimers();
            var button = youtubeVideoButton('#video', 'VIDEO_ID').appendTo('#sandbox');
            $('#video').mouseenter();
            clock.tick(2000);
            button.should.have.css('opacity', '1');
            $('#sandbox > .hovertoast-youtube-video-button:animated').should.exist;
            // TODO Detect that the animation is the one we want
        });
    });

    describe('when video mouseleave', function() {
        it('should be transparent', function() {
            var button = youtubeVideoButton('#video', 'VIDEO_ID').appendTo('#sandbox');
            $('#video').mouseenter().mouseleave();
            button.should.have.css('opacity', '0');
        });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
