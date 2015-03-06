'use strict';

define(['youtube-button', 'jquery', 'sinon'], function(youtubeButton, $, sinon) {
    describe('youtube-button', function() {
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            $('#sandbox').append('<div id="video"></div>');
        });

        it('should have class deckard-youtube-button', function() {
            youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox').should.have.class('deckard-youtube-button');
        });

        it('should be transparent', function() {
            youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox').should.have.css('opacity', '0');
        });

        it('should have position absolute', function() {
            youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox').should.have.css('position', 'absolute');
        });

        it('should load it\'s content', function() {
            youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox').should.have.descendants('div.deckard-youtube-button-inner');
        });

        describe('when mouse event', function() {
            it('= mouseenter, should be opaque', function() {
                youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox').mouseenter().should.have.css('opacity', '1');
            });

            it('= mouseleave, should be transparent', function() {
                youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox').mouseenter().mouseleave().should.have.css('opacity', '0');
            });

            it('= mouseenter, should request youtube info', function() {
                sandbox.stub(chrome.runtime, 'sendMessage');
                var button = youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox');
                chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'info', key: 'youtube' });
                button.mouseenter();
                chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'info', key: 'youtube' });
            });

            it('= mouseleave, should lose confidence in their interest', function() {
                sandbox.stub(chrome.runtime, 'sendMessage');
                var button = youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox');
                button.mouseenter();
                chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'interest', key: 'confidence', value: 'unsure' });
                button.mouseleave();
                chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'interest', key: 'confidence', value: 'unsure' });
            });

            it('= click, should be confident in their interest', function() {
                sandbox.stub(chrome.runtime, 'sendMessage');
                var button = youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox');
                chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'interest', key: 'confidence', value: 'sure' });
                button.click();
                chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'interest', key: 'confidence', value: 'sure' });
            });
        });

        describe('when video mouse event', function() {
            it('= mouseenter, should be opaque', function() {
                var button = youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox');
                $('#video').mouseenter();
                button.should.have.css('opacity', '1');
            });

            it('= mouseleave, should be transparent', function() {
                var button = youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox');
                $('#video').mouseenter().mouseleave();
                button.should.have.css('opacity', '0');
            });

            it('= mouseenter, should fade out starting 2 seconds after', function() {
                var clock = sandbox.useFakeTimers();
                var button = youtubeButton('VIDEO_ID', '#video').appendTo('#sandbox');
                $('#video').mouseenter();
                clock.tick(2000);
                button.should.have.css('opacity', '1');
                $('#sandbox > .deckard-youtube-button:animated').should.exist;
                // TODO Detect that the animation is the one we want
            });
        });

        describe('disperse-throughout', function() {
            it('should attach to youtube embeds', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
                youtubeButton.disperseThroughout('#sandbox');

                $('#sandbox > .deckard-youtube-button').should.exist;
                $('#sandbox > .deckard-youtube-button + embed').should.exist;
            });

            it('should attach to youtube objects', function() {
                $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');
                youtubeButton.disperseThroughout('#sandbox');

                $('#sandbox > .deckard-youtube-button').should.exist;
                $('#sandbox > .deckard-youtube-button + object').should.exist;
            });

            it('should not attach on other embeds', function() {
                $('#sandbox').append('<embed>');
                youtubeButton.disperseThroughout('#sandbox');

                $('#sandbox > .deckard-youtube-button').should.not.exist;
            });

            it('shouldnot attach on other objects', function() {
                $('#sandbox').append('<object></object>');
                youtubeButton.disperseThroughout('#sandbox');

                $('#sandbox > .deckard-youtube-button').should.not.exist;
            });

            it('should be at the same position as the element', function() {
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
});
