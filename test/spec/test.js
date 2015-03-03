/* global $, should, describe, it, before, beforeEach, afterEach, after */
/*jshint expr:true */
'use strict';

(function() {
    /* global putButtons */
    describe('putButtons', function() {
        describe('videos', function() {
            describe('https', function() {
                it('should put a button on youtube https iframes', function() {
                    $('#sandbox').append('<iframe src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + iframe').should.exist;
                });

                it('should put a button on youtube https objects', function() {
                    $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + object').should.exist;
                });

                it('should put a button on youtube https embeds', function() {
                    $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + embed').should.exist;
                });

                it('should put a button on youtube https embedly iframes', function() {
                    $('#sandbox').append('<iframe src="https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FXVCtkzIXYzQ%3Ffeature%3Doembed&amp;url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DXVCtkzIXYzQ&amp;image=http%3A%2F%2Fi.ytimg.com%2Fvi%2FXVCtkzIXYzQ%2Fhqdefault.jpg&amp;key=d04bfffea46d4aeda930ec88cc64b87c&amp;type=text%2Fhtml&amp;schema=youtube"></iframe>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + iframe').should.exist;
                });
            });

            describe('http', function() {
                it('should put a button on youtube http iframes', function() {
                    $('#sandbox').append('<iframe src="http://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + iframe').should.exist;
                });

                it('should put a button on youtube http objects', function() {
                    $('#sandbox').append('<object data="http://www.youtube.com/v/VpXUIh7rlWI"></object>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + object').should.exist;
                });

                it('should put a button on youtube http embeds', function() {
                    $('#sandbox').append('<embed src="http://www.youtube.com/v/VpXUIh7rlWI">');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + embed').should.exist;
                });

                it('should put a button on youtube http embedly iframes', function() {
                    $('#sandbox').append('<iframe src="http://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FXVCtkzIXYzQ%3Ffeature%3Doembed&amp;url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DXVCtkzIXYzQ&amp;image=http%3A%2F%2Fi.ytimg.com%2Fvi%2FXVCtkzIXYzQ%2Fhqdefault.jpg&amp;key=d04bfffea46d4aeda930ec88cc64b87c&amp;type=text%2Fhtml&amp;schema=youtube"></iframe>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + iframe').should.exist;
                });
            });

            describe('relative protocol', function() {
                it('should put a button on youtube protocol relative iframes', function() {
                    $('#sandbox').append('<iframe src="//www.youtube.com/embed/VpXUIh7rlWI"></iframe>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + iframe').should.exist;
                });

                it('should put a button on youtube protocol relative objects', function() {
                    $('#sandbox').append('<object data="//www.youtube.com/v/VpXUIh7rlWI"></object>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + object').should.exist;
                });

                it('should put a button on youtube protocol relative embeds', function() {
                    $('#sandbox').append('<embed src="//www.youtube.com/v/VpXUIh7rlWI">');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + embed').should.exist;
                });

                it('should put a button on youtube protocol relative embedly iframes', function() {
                    $('#sandbox').append('<iframe src="//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FXVCtkzIXYzQ%3Ffeature%3Doembed&amp;url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DXVCtkzIXYzQ&amp;image=http%3A%2F%2Fi.ytimg.com%2Fvi%2FXVCtkzIXYzQ%2Fhqdefault.jpg&amp;key=d04bfffea46d4aeda930ec88cc64b87c&amp;type=text%2Fhtml&amp;schema=youtube"></iframe>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + iframe').should.exist;
                });
            });

            describe('without www', function() {
                it('should put a button on youtube iframes without "www"', function() {
                    $('#sandbox').append('<iframe src="https://youtube.com/embed/VpXUIh7rlWI"></iframe>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + iframe').should.exist;
                });

                it('should put a button on youtube objects without "www"', function() {
                    $('#sandbox').append('<object data="https://youtube.com/v/VpXUIh7rlWI"></object>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + object').should.exist;
                });

                it('should put a button on youtube embeds without "www"', function() {
                    $('#sandbox').append('<embed src="https://youtube.com/v/VpXUIh7rlWI">');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + embed').should.exist;
                });
            });

            describe('not youtube', function() {
                it('should not put a button on other iframes', function() {
                    $('#sandbox').append('<iframe></iframe>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.not.exist;
                });

                it('should not put a button on other objects', function() {
                    $('#sandbox').append('<object></object>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.not.exist;
                });

                it('should not put a button on other embeds', function() {
                    $('#sandbox').append('<embed>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.not.exist;
                });

                it('should not put a button on other embedly iframes', function() {
                    $('#sandbox').append('<iframe class="embedly-embed" src="//cdn.embedly.com/widgets/media.html?src=http%3A%2F%2Fplayer.vimeo.com%2Fvideo%2F18150336&src_secure=1&url=https%3A%2F%2Fvimeo.com%2F18150336&image=http%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F117311910_1280.jpg&key=internal&type=text%2Fhtml&schema=vimeo" width="500" height="281" scrolling="no" frameborder="0" allowfullscreen></iframe>');

                    putButtons('#sandbox');

                    $('#sandbox > div.deckard-button').should.not.exist;
                });
            });
        });

        describe('button', function() {
            it('should load it\'s content', function() {
                chrome.runtime.sendMessage = function(message, callback) {
                    message.cmd.should.equal('load_html');
                    message.fileName.should.equal('button.html');
                    callback('Button Content');
                };
                $('#sandbox').append('<iframe src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');

                putButtons('#sandbox');

                $('#sandbox > div.deckard-button').should.have.html('Button Content');
            });

            it('should only ever put one button on each video', function() {
                $('#sandbox').append('<iframe src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');

                putButtons('#sandbox');
                putButtons('#sandbox');

                $('#sandbox > div.deckard-button').should.have.length(1);
            });

            it('should at the same position as the youtube video', function() {
                $('#sandbox').append('<iframe src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');

                putButtons('#sandbox');

                $('#sandbox > div.deckard-button').offset().left.should.equal($('#sandbox > iframe').offset().left);
                $('#sandbox > div.deckard-button').offset().top.should.equal($('#sandbox > iframe').offset().top);
            });

            it('should follow the video when the window resizes', function() {
                $('#sandbox').append('<iframe src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');

                putButtons('#sandbox');

                $('#sandbox > iframe').css('position', 'relative');
                $('#sandbox > iframe').css('left', '10px');
                $('#sandbox > iframe').css('top', '11px');
                $(window).trigger('resize');
                $('#sandbox > div.deckard-button').offset().left.should.equal($('#sandbox > iframe').offset().left);
                $('#sandbox > div.deckard-button').offset().top.should.equal($('#sandbox > iframe').offset().top);
            });
        });

        var originalSendMessage;
        before(function() {
            originalSendMessage = chrome.runtime.sendMessage;
        });

        afterEach(function() {
            $('#sandbox').empty();
        });

        after(function() {
            chrome.runtime.sendMessage = originalSendMessage;
        });
    });

    /* global loadHtml */
    describe('loadHtml', function() {
        describe('ajax', function() {
            it('should should make an ajax call', function(done) {
                $.ajax = function(settings) {
                    settings.url.should.match(/^chrome:\/\/gibberish_id\/somefile.html$/);
                    settings.dataType.should.equal('html');
                    settings.success('Some File\'s Content');
                };

                loadHtml();

                chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'somefile.html' }, function(data) {
                    data.should.equal('Some File\'s Content');
                    done();
                });
            });


            var originalSendMessage;
            var originalAddListener;
            var originalAjax;
            var originalGetURL;
            var listener;
            before(function() {
                originalSendMessage = chrome.runtime.sendMessage;
                originalAddListener = chrome.runtime.onMessage.addListener;
                originalAjax = $.ajax;
                originalGetURL = chrome.extension.getURL;
            });

            beforeEach(function() {
                chrome.runtime.sendMessage = function(message, callback) {
                    listener(message, {}, callback).should.be.true;
                };
                chrome.runtime.onMessage.addListener = function(callback) {
                    should.not.exist(listener);
                    listener = callback;
                };
                chrome.extension.getURL = function(fileName) {
                    return 'chrome://gibberish_id/' + fileName;
                };
            });

            afterEach(function() {
                chrome.runtime.sendMessage = originalSendMessage;
                chrome.runtime.onMessage.addListener = originalAddListener;
                $.ajax = originalAjax;
                chrome.extension.getURL = originalGetURL;
                listener = null;
            });
        });
    });
})();
