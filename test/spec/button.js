/* global $, describe, it, afterEach */
/*jshint expr:true */
'use strict';

(function() {
    /* global button */
    describe('button', function() {
        it('should have class deckard-button', function() {
            $('#sandbox').append(button());

            $('#sandbox > .deckard-button').should.exist;
        });

        it('should have position absolute', function() {
            $('#sandbox').append(button());

            $('#sandbox > .deckard-button').should.have.css('position', 'absolute');
        });

        it('should load it\'s content', function() {
            chrome.runtime.sendMessage = function(message, callback) {
                message.cmd.should.equal('load_html');
                message.fileName.should.equal('button.html');
                callback('Button Content');
            };

            $('#sandbox').append(button());

            $('#sandbox > div.deckard-button').should.have.html('Button Content');
        });

        afterEach(function() {
            $('#sandbox').empty();
        });
    });
})();
