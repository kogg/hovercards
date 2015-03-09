'use strict';

describe('youtube-button', function() {
    var sandbox = sinon.sandbox.create();
    var youtubeButton;

    beforeEach(function(done) {
        $('#sandbox').append('<div id="video"></div>');
        require(['youtube-button'], function(_youtubeButton) {
            youtubeButton = _youtubeButton;
            done();
        });
    });

    it('should have class deckard-youtube-button', function() {
        youtubeButton('#video', 'VIDEO_ID').appendTo('#sandbox').should.have.class('deckard-youtube-button');
    });

    it('should be transparent', function() {
        youtubeButton('#video', 'VIDEO_ID').appendTo('#sandbox').should.have.css('opacity', '0');
    });

    it('should have position absolute', function() {
        youtubeButton('#video', 'VIDEO_ID').appendTo('#sandbox').should.have.css('position', 'absolute');
    });

    it('should load it\'s content', function() {
        youtubeButton('#video', 'VIDEO_ID').appendTo('#sandbox').should.have.descendants('div.deckard-youtube-button-inner');
    });

    describe('when mouse event', function() {
        it('= mouseenter, should be opaque', function() {
            youtubeButton('#video', 'VIDEO_ID').appendTo('#sandbox').mouseenter().should.have.css('opacity', '1');
        });

        it('= mouseleave, should be transparent', function() {
            youtubeButton('#video', 'VIDEO_ID').appendTo('#sandbox').mouseenter().mouseleave().should.have.css('opacity', '0');
        });
    });

    describe('when video mouse event', function() {
        it('= mouseenter, should be opaque', function() {
            var button = youtubeButton('#video', 'VIDEO_ID').appendTo('#sandbox');
            $('#video').mouseenter();
            button.should.have.css('opacity', '1');
        });

        it('= mouseleave, should be transparent', function() {
            var button = youtubeButton('#video', 'VIDEO_ID').appendTo('#sandbox');
            $('#video').mouseenter().mouseleave();
            button.should.have.css('opacity', '0');
        });

        it('= mouseenter, should fade out starting 2 seconds after', function() {
            var clock = sandbox.useFakeTimers();
            var button = youtubeButton('#video', 'VIDEO_ID').appendTo('#sandbox');
            $('#video').mouseenter();
            clock.tick(2000);
            button.should.have.css('opacity', '1');
            $('#sandbox > .deckard-youtube-button:animated').should.exist;
            // TODO Detect that the animation is the one we want
        });
    });

    describe('disperse-throughout', function() {
        // FIXME These tests in phantomJS because the embed loading gets cancelled
        (navigator.userAgent.indexOf('PhantomJS') < 0 ? it : it.skip)
        ('should attach to youtube embeds', function() {
            $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
            youtubeButton.disperseThroughout('#sandbox');

            $('#sandbox > .deckard-youtube-button').should.exist;
            $('#sandbox > .deckard-youtube-button').should.have.data('deckard_network', 'youtube');
            $('#sandbox > .deckard-youtube-button').should.have.data('deckard_id', 'VpXUIh7rlWI');
            $('#sandbox > .deckard-youtube-button + embed').should.exist;
        });

        // FIXME These tests in phantomJS because the object loading gets cancelled
        (navigator.userAgent.indexOf('PhantomJS') < 0 ? it : it.skip)
        ('should attach to youtube objects', function() {
            $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');
            youtubeButton.disperseThroughout('#sandbox');

            $('#sandbox > .deckard-youtube-button').should.exist;
            $('#sandbox > .deckard-youtube-button').should.have.data('deckard_network', 'youtube');
            $('#sandbox > .deckard-youtube-button').should.have.data('deckard_id', 'VpXUIh7rlWI');
            $('#sandbox > .deckard-youtube-button + object').should.exist;
        });

        it('should not attach on other embeds', function() {
            $('#sandbox').append('<embed>');
            youtubeButton.disperseThroughout('#sandbox');

            $('#sandbox > .deckard-youtube-button').should.not.exist;
        });

        it('should not attach on other objects', function() {
            $('#sandbox').append('<object></object>');
            youtubeButton.disperseThroughout('#sandbox');

            $('#sandbox > .deckard-youtube-button').should.not.exist;
        });

        // FIXME These tests in phantomJS because the embed loading gets cancelled
        (navigator.userAgent.indexOf('PhantomJS') < 0 ? it : it.skip)
        ('should be at the same position as the element', function() {
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
