/* global describe, it, $, before, after */
/* global wrapElements */
/*jshint expr:true */

if (!chrome) { chrome = {}; }
if (!chrome.runtime) { chrome.runtime = {}; }
if (!chrome.runtime.sendMessage) { chrome.runtime.sendMessage = $.noop; }

(function () {
    'use strict';

    describe('wrapElements', function () {
        describe('default youtube embed', function () {
            it('should wrap the element', function () {
                $('#sandbox > iframe#youtube_video').should.not.exist;
                $('#sandbox > .deckard_extension > iframe#youtube_video').should.exist;
            });

            it('shouldn\'t wrap other iframes', function () {
                $('#sandbox > iframe#not_youtube_video').should.exist;
                $('#sandbox > .deckard_extension > iframe#not_youtube_video').should.not.exist;
            });

            it('should load minimal content', function() {
                $('#sandbox > .deckard_extension > iframe#youtube_video + .deckard_minimal').should.exist;
                $('#sandbox > .deckard_extension > iframe#youtube_video + .deckard_minimal').should.have.html('Minimal Content');
            });

            before(function() {
                $('#sandbox').append('<iframe id="youtube_video" width="560" height="315" src="https://www.youtube.com/embed/VpXUIh7rlWI" frameborder="0" allowfullscreen></iframe>');
                $('#sandbox').append('<iframe id="not_youtube_video"></iframe>');

                var originalSendMessage = chrome.runtime.sendMessage;
                chrome.runtime.sendMessage = function(message, callback) {
                    if (message.cmd !== 'load_html' || message.fileName !== 'minimal.html') {
                        originalSendMessage.apply(this, arguments);
                    }
                    callback('Minimal Content');
                };
                wrapElements('#sandbox');
                chrome.runtime.sendMessage = originalSendMessage;
            });

            after(function() {
                $('#sandbox').empty();
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
