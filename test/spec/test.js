/* global $, should, describe, it, before, beforeEach, afterEach, after */
/*jshint expr:true */
'use strict';

(function() {
    /* global putButtons */
    describe('putButtons', function() {
        describe('videos', function() {
            describe('iframe', function() {
                it('should put a button on youtube https iframes', function() {
                    $('#sandbox').append('<iframe src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');
                    (function() {
                        putButtons('#sandbox');
                    }());
                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + iframe').should.exist;
                });

                it('should put a button on youtube http iframes', function() {
                    $('#sandbox').append('<iframe src="http://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');
                    (function() {
                        putButtons('#sandbox');
                    }());
                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + iframe').should.exist;
                });

                it('should not put a button on other iframes', function() {
                    $('#sandbox').append('<iframe></iframe>');
                    (function() {
                        putButtons('#sandbox');
                    }());
                    $('#sandbox > div.deckard-button').should.not.exist;
                });
            });

            describe('object', function() {
                it('should put a button on youtube https objects', function() {
                    $('#sandbox').append('<object data="https://www.youtube.com/v/VpXUIh7rlWI"></object>');
                    (function() {
                        putButtons('#sandbox');
                    }());
                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + object').should.exist;
                });

                it('should put a button on youtube http objects', function() {
                    $('#sandbox').append('<object data="http://www.youtube.com/v/VpXUIh7rlWI"></object>');
                    (function() {
                        putButtons('#sandbox');
                    }());
                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + object').should.exist;
                });

                it('should not put a button on other objects', function() {
                    $('#sandbox').append('<object></object>');
                    (function() {
                        putButtons('#sandbox');
                    }());
                    $('#sandbox > div.deckard-button').should.not.exist;
                });
            });

            describe('embed', function() {
                it('should put a button on youtube https embeds', function() {
                    $('#sandbox').append('<embed src="https://www.youtube.com/v/VpXUIh7rlWI">');
                    (function() {
                        putButtons('#sandbox');
                    }());
                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + embed').should.exist;
                });

                it('should put a button on youtube http embeds', function() {
                    $('#sandbox').append('<embed src="http://www.youtube.com/v/VpXUIh7rlWI">');
                    (function() {
                        putButtons('#sandbox');
                    }());
                    $('#sandbox > div.deckard-button').should.exist;
                    $('#sandbox > div.deckard-button + embed').should.exist;
                });

                it('should not put a button on other embeds', function() {
                    $('#sandbox').append('<embed>');
                    (function() {
                        putButtons('#sandbox');
                    }());
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
                (function() {
                    putButtons('#sandbox');
                }());
                $('#sandbox > div.deckard-button').should.have.html('Button Content');
            });

            it('should be on top of the youtube video', function() {
                $('#sandbox').append('<iframe src="https://www.youtube.com/embed/VpXUIh7rlWI"></iframe>');
                (function() {
                    putButtons('#sandbox');
                }());
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
