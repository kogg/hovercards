/* global describe, it, $, before, after, beforeEach, afterEach */
/*jshint expr:true */
'use strict';

(function() {

    /* global wrapElements */
    describe('wrapElements', function() {
        describe('default youtube embed', function() {
            it('should wrap the element', function() {
                wrapElements('#sandbox');
                $('#sandbox > iframe#youtube_video').should.not.exist;
                $('#sandbox > .deckard_extension > iframe#youtube_video').should.exist;
            });

            it('shouldn\'t wrap other iframes', function() {
                wrapElements('#sandbox');
                $('#sandbox > iframe#not_youtube_video').should.exist;
                $('#sandbox > .deckard_extension > iframe#not_youtube_video').should.not.exist;
            });

            it('should load minimal content', function() {
                // Mocking sending the message
                var originalSendMessage = chrome.runtime.sendMessage;
                chrome.runtime.sendMessage = function(message, callback) {
                    message.cmd.should.equal('load_html');
                    message.fileName.should.equal('minimal.html');
                    callback('Minimal Content');
                };

                wrapElements('#sandbox');
                $('#sandbox > .deckard_extension > iframe#youtube_video + .deckard_minimal').should.exist;
                $('#sandbox > .deckard_extension > iframe#youtube_video + .deckard_minimal').should.have.html('Minimal Content');

                // Undo the mocking
                chrome.runtime.sendMessage = originalSendMessage;
            });

            beforeEach(function() {
                $('#sandbox').append('<iframe id="youtube_video" width="560" height="315" src="https://www.youtube.com/embed/VpXUIh7rlWI" frameborder="0" allowfullscreen></iframe>');
                $('#sandbox').append('<iframe id="not_youtube_video"></iframe>');
            });

            afterEach(function() {
                $('#sandbox').empty();
            });
        });
    });

    /* global minimal */
    describe('minimal', function() {
        describe('load_html', function() {
            it('should should make an ajax call', function() {
                var listener;
                // Mocking sending the message
                var originalSendMessage = chrome.runtime.sendMessage;
                chrome.runtime.sendMessage = function(message, callback) {
                    listener(message, {}, callback).should.equal(true);
                };
                // Mocking adding a listener
                var originalAddListener = chrome.runtime.onMessage.addListener;
                chrome.runtime.onMessage.addListener = function(callback) {
                    listener = callback;
                };
                // Mocking doing ajax
                var originalAjax = $.ajax;
                $.ajax = function(settings) {
                    settings.url.should.match(/^chrome:\/\/gibberish_id\/somefile.html$/);
                    settings.dataType.should.equal('html');
                    settings.success('Minimal Content');
                };
                // Mocking getting the chrome url
                var originalGetURL = chrome.extension.getURL;
                chrome.extension.getURL = function(fileName) {
                    return 'chrome://gibberish_id/' + fileName;
                };

                minimal();
                chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'somefile.html' }, function(data) {
                    data.should.equal('Minimal Content');
                });

                // Undo the mocking
                chrome.runtime.sendMessage = originalSendMessage;
                chrome.runtime.onMessage.addListener = originalAddListener;
                $.ajax = originalAjax;
                chrome.extension.getURL = originalGetURL;
            });
        });
    });

    // Something about how chai-jquery works freaks out with circular references, so this deals with that
    var originalStringify;
    before(function() {
        originalStringify = JSON.stringify;
        JSON.stringify = function(obj) {
            var seen = [];

            var result = originalStringify(obj, function(key, val) {
                if (val instanceof HTMLElement) { return val.outerHTML; }
                if (typeof val === 'object') {
                    if (seen.indexOf(val) >= 0) { return '[Circular]'; }
                    seen.push(val);
                }
                return val;
            });
            return result;
        };
    });

    after(function() {
        JSON.stringify = originalStringify;
    });
})();
