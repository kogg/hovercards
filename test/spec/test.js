/* global $, should, describe, it, before, after, afterEach */
/*jshint expr:true */
'use strict';

(function() {
    /* global wrapElements */
    describe('wrapElements', function() {
        describe('iframe', function() {
            it('should wrap youtube iframes', function() {
                $('#sandbox').append('<iframe id="youtube_video" src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');
                wrapElements('#sandbox');
                $('#sandbox > iframe#youtube_video').should.not.exist;
                $('#sandbox > .deckard_extension > iframe#youtube_video').should.exist;
            });

            it('shouldn\'t wrap other iframes', function() {
                $('#sandbox').append('<iframe id="not_youtube_video"></iframe>');
                wrapElements('#sandbox');
                $('#sandbox > iframe#not_youtube_video').should.exist;
                $('#sandbox > .deckard_extension > iframe#not_youtube_video').should.not.exist;
            });

            it('should wrap http youtube iframes', function() {
                $('#sandbox').append('<iframe id="youtube_video_with_http" src="http://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');
                wrapElements('#sandbox');
                $('#sandbox > iframe#youtube_video_with_http').should.not.exist;
                $('#sandbox > .deckard_extension > iframe#youtube_video_with_http').should.exist;
            });

            it('should load minimal content under the iframe', function() {
                $('#sandbox').append('<iframe id="youtube_video" src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');
                wrapElements('#sandbox');
                $('#sandbox > .deckard_extension > iframe#youtube_video + .deckard_minimal').should.exist;
                $('#sandbox > .deckard_extension > iframe#youtube_video + .deckard_minimal').should.have.html('Minimal Content');
            });

            afterEach(function() {
                $('#sandbox').empty();
            });
        });

        describe('object', function() {
            it('should wrap youtube objects', function() {
                $('#sandbox').append('<object id="youtube_video" data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');
                wrapElements('#sandbox');
                $('#sandbox > object#youtube_video').should.not.exist;
                $('#sandbox > .deckard_extension > object#youtube_video').should.exist;
            });

            it('shouldn\'t wrap other objects', function() {
                $('#sandbox').append('<object id="not_youtube_video"></object>');
                wrapElements('#sandbox');
                $('#sandbox > object#not_youtube_video').should.exist;
                $('#sandbox > .deckard_extension > object#not_youtube_video').should.not.exist;
            });

            it('should load minimal content under the object', function() {
                $('#sandbox').append('<object id="youtube_video" data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');
                wrapElements('#sandbox');
                $('#sandbox > .deckard_extension > object#youtube_video + .deckard_minimal').should.exist;
                $('#sandbox > .deckard_extension > object#youtube_video + .deckard_minimal').should.have.html('Minimal Content');
            });

            it('should wrap http youtube objects', function() {
                $('#sandbox').append('<object id="youtube_video_with_http" data="http://www.youtube.com/v/VpXUIh7rlWI"></object>');
                wrapElements('#sandbox');
                $('#sandbox > object#youtube_video_with_http').should.not.exist;
                $('#sandbox > .deckard_extension > object#youtube_video_with_http').should.exist;
            });

            afterEach(function() {
                $('#sandbox').empty();
            });
        });

        describe('embed', function() {
            it('should wrap youtube embeds', function() {
                $('#sandbox').append('<embed id="youtube_video" src="https://www.youtube.com/v/VpXUIh7rlWI">');
                wrapElements('#sandbox');
                $('#sandbox > embed#youtube_video').should.not.exist;
                $('#sandbox > .deckard_extension > embed#youtube_video').should.exist;
            });

            it('shouldn\'t wrap other embeds', function() {
                $('#sandbox').append('<embed id="not_youtube_video">');
                wrapElements('#sandbox');
                $('#sandbox > embed#not_youtube_video').should.exist;
                $('#sandbox > .deckard_extension > embed#not_youtube_video').should.not.exist;
            });

            it('should load minimal content under the embed', function() {
                $('#sandbox').append('<embed id="youtube_video" src="https://www.youtube.com/v/VpXUIh7rlWI">');
                wrapElements('#sandbox');
                $('#sandbox > .deckard_extension > embed#youtube_video + .deckard_minimal').should.exist;
                $('#sandbox > .deckard_extension > embed#youtube_video + .deckard_minimal').should.have.html('Minimal Content');
            });

            it('should wrap http youtube embeds', function() {
                $('#sandbox').append('<embed id="youtube_video_with_http" src="http://www.youtube.com/v/VpXUIh7rlWI">');
                wrapElements('#sandbox');
                $('#sandbox > embed#youtube_video_with_http').should.not.exist;
                $('#sandbox > .deckard_extension > embed#youtube_video_with_http').should.exist;
            });

            afterEach(function() {
                $('#sandbox').empty();
            });
        });

        before(function() {
            originalSendMessage = chrome.runtime.sendMessage;
            chrome.runtime.sendMessage = function(message, callback) {
                message.cmd.should.equal('load_html');
                message.fileName.should.equal('minimal.html');
                callback('Minimal Content');
            };
        });

        after(function() {
            chrome.runtime.sendMessage = originalSendMessage;
        });

        var originalSendMessage;
    });

    /* global minimal */
    describe('minimal', function() {
        describe('load_html', function() {
            it('should should make an ajax call', function() {
                minimal();
                chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'somefile.html' }, function(data) {
                    data.should.equal('Some File\'s Content');
                });
            });

            before(function() {
                var listener;
                originalSendMessage = chrome.runtime.sendMessage;
                chrome.runtime.sendMessage = function(message, callback) {
                    listener(message, {}, callback).should.equal(true);
                };

                originalAddListener = chrome.runtime.onMessage.addListener;
                chrome.runtime.onMessage.addListener = function(callback) {
                    should.not.exist(listener);
                    listener = callback;
                };

                originalAjax = $.ajax;
                $.ajax = function(settings) {
                    settings.url.should.match(/^chrome:\/\/gibberish_id\/somefile.html$/);
                    settings.dataType.should.equal('html');
                    settings.success('Some File\'s Content');
                };

                originalGetURL = chrome.extension.getURL;
                chrome.extension.getURL = function(fileName) {
                    fileName.should.equal('somefile.html');
                    return 'chrome://gibberish_id/' + fileName;
                };
            });

            after(function() {
                chrome.runtime.sendMessage = originalSendMessage;
                chrome.runtime.onMessage.addListener = originalAddListener;
                $.ajax = originalAjax;
                chrome.extension.getURL = originalGetURL;
            });

            var originalSendMessage;
            var originalAddListener;
            var originalAjax;
            var originalGetURL;
        });
    });

    // This guards against a crazy phantomjs error we're getting where all the tests run, but the console shows none of it.
    // It used to only happen on fail, but now its happening all the time.
    /*
    it('takes time', function(done) {
        setTimeout(function() {
            done();
        }, 1);
    });
    */
})();
