/* global $, should, describe, it, before, beforeEach, afterEach */
/*jshint expr:true */
'use strict';

(function() {
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

        afterEach(function() {
            $('sandbox').empty();
        });
    });
})();
