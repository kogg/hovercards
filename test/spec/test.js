/* global $, describe, it, before, afterEach, after */
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
})();
