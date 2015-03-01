/* global $, should, describe, it, before, after, afterEach */
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

            it('shouldn\'t wrap other iframes', function() {
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

            it('should load minimal content under the iframe', function() {
                $('#sandbox').append('<iframe src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > .deckard-extension > iframe + .deckard-minimal').should.exist;
                $('#sandbox > .deckard-extension > iframe + .deckard-minimal').should.have.html('Minimal Content');
            });

            it('should inherit the iframe\'s styles and add the height of the minimal');
            it('should strip the iframe of it\'s styles, except for the width/height');

            afterEach(function() {
                $('#sandbox').empty();
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

            it('shouldn\'t wrap other objects', function() {
                $('#sandbox').append('<object></object>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > object').should.exist;
                $('#sandbox > .deckard-extension > object').should.not.exist;
            });

            it('should load minimal content under the object', function() {
                $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');
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

            it('should inherit the object\'s styles and add the height of the minimal');
            it('should strip the object of it\'s styles, except for the width/height');

            afterEach(function() {
                $('#sandbox').empty();
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

            it('shouldn\'t wrap other embeds', function() {
                $('#sandbox').append('<embed>');
                (function() {
                    wrapElements('#sandbox');
                }());
                $('#sandbox > embed').should.exist;
                $('#sandbox > .deckard-extension > embed').should.not.exist;
            });

            it('should load minimal content under the embed', function() {
                $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
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

            it('should inherit the embed\'s styles and add the height of the minimal');
            it('should strip the embed of it\'s styles, except for the width/height');

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
            it('should should make an ajax call', function(done) {
                (function() {
                    minimal();
                }());
                chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'somefile.html' }, function(data) {
                    data.should.equal('Some File\'s Content');
                    done();
                });
            });

            it.skip('shouldn\'t make multiple ajax calls for the same html file', function(done) {
                var count = 0;
                var ajax = $.ajax;
                $.ajax = function(settings) {
                    count++;
                    ajax(settings);
                };
                (function() {
                    minimal();
                }());
                chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'somefile.html' }, function() {
                    count.should.equal(1);
                    chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'somefile.html' }, function() {
                        count.should.equal(1);
                        done();
                    });
                });
            });

            before(function() {
                originalSendMessage = chrome.runtime.sendMessage;
                chrome.runtime.sendMessage = function(message, callback) {
                    listener(message, {}, callback);
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

            afterEach(function() {
                listener = null;
            });

            var originalSendMessage;
            var originalAddListener;
            var originalAjax;
            var originalGetURL;
            var listener;
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
