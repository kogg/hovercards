/* global describe, it, $, beforeEach, afterEach */
/* global wrapElements */
/*jshint expr:true */

(function () {
    'use strict';

    // Something crazy happens with the chai thing so I avoid it
    var originalStringify = JSON.stringify;
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

    describe('wrap_elements', function () {
        describe('default youtube wrapping', function () {
            beforeEach(function() {
                $('#sandbox').append('<iframe id="youtube_video" width="560" height="315" src="https://www.youtube.com/embed/VpXUIh7rlWI" frameborder="0" allowfullscreen></iframe>');
                $('#sandbox').append('<iframe id="not_youtube_video"></iframe>');
                wrapElements('#sandbox');
            });

            it('should wrap the element', function () {
                $('#sandbox >  iframe#youtube_video').should.not.exist;
                $('#sandbox > .deckard_extension > iframe#youtube_video').should.exist;
            });

            it('shouldn\'t wrap other iframes', function () {
                $('#sandbox >  iframe#not_youtube_video').should.exist;
                $('#sandbox > .deckard_extension > iframe#not_youtube_video').should.not.exist;
            });

            afterEach(function() {
                $('#sandbox').empty();
            });
        });
    });
})();
