'use strict';

define(['youtube-button', 'sinon'], function(youtubeButton, sinon) {
    describe('youtube-button', function() {
        var sandbox = sinon.sandbox.create();

        beforeEach(function() {
            $('#sandbox').append('<div id="video"></div>');
        });

        describe('view', function() {
            describe('initial', function() {
                it('should have class deckard-youtube-button', function() {
                    youtubeButton('#video').appendTo('#sandbox').should.have.class('deckard-youtube-button');
                });

                it('should be transparent', function() {
                    youtubeButton('#video').appendTo('#sandbox').should.have.css('opacity', '0');
                });

                it('should have position absolute', function() {
                    youtubeButton('#video').appendTo('#sandbox').should.have.css('position', 'absolute');
                });

                it('should load it\'s content', function() {
                    youtubeButton('#video').appendTo('#sandbox').should.have.descendants('div.deckard-youtube-button-inner');
                });
            });

            describe('hover', function() {
                it('should be opaque on mouseenter', function() {
                    youtubeButton('#video').appendTo('#sandbox').mouseenter().should.have.css('opacity', '1');
                });

                it('should be transparent on mouseleave', function() {
                    youtubeButton('#video').appendTo('#sandbox').mouseenter().mouseleave().should.have.css('opacity', '0');
                });

                it('should still be opaque 2 seconds after mouseenter', function() {
                    var clock = sandbox.useFakeTimers();
                    var button = youtubeButton('#video').appendTo('#sandbox').mouseenter();
                    clock.tick(2000);
                    button.should.have.css('opacity', '1');
                    $('#sandbox > .deckard-youtube-button:animated').should.not.exist;
                });
            });

            describe('video hover', function() {
                it('should be opaque on video mouseenter', function() {
                    var button = youtubeButton('#video').appendTo('#sandbox');
                    $('#video').mouseenter();
                    button.should.have.css('opacity', '1');
                });

                it('should be transparent on video mouseleave', function() {
                    var button = youtubeButton('#video').appendTo('#sandbox');
                    $('#video').mouseenter().mouseleave();
                    button.should.have.css('opacity', '0');
                });

                it('should fade out starting 2 seconds after video mouseenter', function() {
                    var clock = sandbox.useFakeTimers();
                    var button = youtubeButton('#video').appendTo('#sandbox');
                    $('#video').mouseenter();
                    clock.tick(2000);
                    button.should.have.css('opacity', '1');
                    $('#sandbox > .deckard-youtube-button:animated').should.exist;
                    // TODO Detect that the animation is the one we want
                });
            });
        });

        describe('info', function() {
            it('should request youtube info on mouseenter', function() {
                sandbox.stub(chrome.runtime, 'sendMessage');
                var button = youtubeButton('#video').appendTo('#sandbox');
                chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'info', key: 'youtube' });
                button.mouseenter();
                chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'info', key: 'youtube' });
            });
        });

        describe('interest', function() {
            it('should be confident in their interest on click', function() {
                sandbox.stub(chrome.runtime, 'sendMessage');
                var button = youtubeButton('#video').appendTo('#sandbox');
                chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'interest', key: 'confidence', value: 'sure' });
                button.click();
                chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'interest', key: 'confidence', value: 'sure' });
            });

            it('should lose confidence in their interest on mouseleave', function() {
                sandbox.stub(chrome.runtime, 'sendMessage');
                var button = youtubeButton('#video').appendTo('#sandbox');
                button.mouseenter();
                chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'interest', key: 'confidence', value: 'unsure' });
                button.mouseleave();
                chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'interest', key: 'confidence', value: 'unsure' });
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
});
