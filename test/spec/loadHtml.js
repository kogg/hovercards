'use strict';

(function() {
    /* global loadHtml */
    describe('loadHtml', function() {
        describe('ajax', function() {
            it('should should make an ajax call', function(done) {
                sandbox.stub($, 'ajax')
                    .yieldsTo('success', 'Some File\'s Content');
                sandbox.stub(chrome.extension, 'getURL')
                    .returns('chrome://gibberish_id/somefile.html');
                sandbox.stub(chrome.runtime.onMessage, 'addListener');

                loadHtml();
                chrome.runtime.onMessage.addListener
                    .yield({ cmd: 'load_html', fileName: 'somefile.html' }, {}, function(data) {
                        chrome.extension.getURL
                            .should.have.been.calledWith('somefile.html');
                        $.ajax
                            .should.have.been.calledWith(sinon.match.has('url', 'chrome://gibberish_id/somefile.html')
                                                    .and(sinon.match.has('dataType', 'html'))
                                                    .and(sinon.match.has('success', sinon.match.func)));
                        data
                            .should.equal('Some File\'s Content');
                        done();
                    });
            });
        });

        var sandbox;

        before(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
})();
