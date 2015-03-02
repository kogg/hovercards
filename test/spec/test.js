/* global $, should, describe, it, before, beforeEach, afterEach */
/*jshint expr:true */
'use strict';

(function() {
    /* global wrapElements */
    describe('wrapElements', function() {
        describe('iframe', function() {
            it('should wrap youtube iframes', function() {
                $('#sandbox').append('<iframe src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > iframe').should.not.exist;
                $('#sandbox > .deckard-extension > iframe').should.exist;
            });

            it('should not wrap other iframes', function() {
                $('#sandbox').append('<iframe></iframe>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > iframe').should.exist;
                $('#sandbox > .deckard-extension > iframe').should.not.exist;
            });

            it('should wrap http youtube iframes', function() {
                $('#sandbox').append('<iframe src="http://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > iframe').should.not.exist;
                $('#sandbox > .deckard-extension > iframe').should.exist;
            });

            it('should load minimal content into the wrapper', function() {
                $('#sandbox').append('<iframe src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');
                chrome.runtime.sendMessage = function(message, callback) {
                    message.cmd.should.equal('load_html');
                    message.fileName.should.equal('minimal.html');
                    callback('Minimal Content');
                };
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > .deckard-extension > iframe + .deckard-minimal').should.exist;
                $('#sandbox > .deckard-extension > iframe + .deckard-minimal').should.have.html('Minimal Content');
            });

            it('should copy the iframe\'s width', function() {
                $('#sandbox').append('<iframe src="https://www.youtube.com/embed/VpXUIh7rlWI" width="500"></iframe>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > .deckard-extension').should.have.css('width', '500px');
                $('#sandbox > .deckard-extension > iframe').should.have.css('width', '500px');
            });
        });

        describe('object', function() {
            it('should wrap youtube objects', function() {
                $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > object').should.not.exist;
                $('#sandbox > .deckard-extension > object').should.exist;
            });

            it('should not wrap other objects', function() {
                $('#sandbox').append('<object></object>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > object').should.exist;
                $('#sandbox > .deckard-extension > object').should.not.exist;
            });

            it('should load minimal content into the wrapper', function() {
                $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');
                chrome.runtime.sendMessage = function(message, callback) {
                    message.cmd.should.equal('load_html');
                    message.fileName.should.equal('minimal.html');
                    callback('Minimal Content');
                };
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > .deckard-extension > object + .deckard-minimal').should.exist;
                $('#sandbox > .deckard-extension > object + .deckard-minimal').should.have.html('Minimal Content');
            });

            it('should wrap http youtube objects', function() {
                $('#sandbox').append('<object data="http://www.youtube.com/v/VpXUIh7rlWI"></object>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > object').should.not.exist;
                $('#sandbox > .deckard-extension > object').should.exist;
            });

            it('should copy the object\'s width', function() {
                $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI" width="500"></object>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > .deckard-extension').should.have.css('width', '500px');
                $('#sandbox > .deckard-extension > object').should.have.css('width', '500px');
            });
        });

        describe('embed', function() {
            it('should wrap youtube embeds', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > embed').should.not.exist;
                $('#sandbox > .deckard-extension > embed').should.exist;
            });

            it('should not wrap other embeds', function() {
                $('#sandbox').append('<embed>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > embed').should.exist;
                $('#sandbox > .deckard-extension > embed').should.not.exist;
            });

            it('should load minimal content into the wrapper', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
                chrome.runtime.sendMessage = function(message, callback) {
                    message.cmd.should.equal('load_html');
                    message.fileName.should.equal('minimal.html');
                    callback('Minimal Content');
                };
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > .deckard-extension > embed + .deckard-minimal').should.exist;
                $('#sandbox > .deckard-extension > embed + .deckard-minimal').should.have.html('Minimal Content');
            });

            it('should wrap http youtube embeds', function() {
                $('#sandbox').append('<embed src="http://www.youtube.com/v/VpXUIh7rlWI">');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > embed').should.not.exist;
                $('#sandbox > .deckard-extension > embed').should.exist;
            });

            it('should copy the embed\'s width', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI" width="500">');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > .deckard-extension').should.have.css('width', '500px');
                $('#sandbox > .deckard-extension > embed').should.have.css('width', '500px');
            });
        });

        var originalSendMessage;
        before(function() {
            originalSendMessage = chrome.runtime.sendMessage;
        });

        afterEach(function() {
            chrome.runtime.sendMessage = originalSendMessage;
            $('#sandbox').empty();
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
                (function() {
                    loadHtml();
                }());
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

    // This guards against a crazy phantomjs error we're getting where all the tests run, but the console shows none of it.
    // It used to only happen on fail, but now its happening all the time.
    it('takes time', function(done) {
        setTimeout(function() {
            done();
        }, 1);
    });
})();
