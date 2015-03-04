'use strict';

(function() {
    /* global loadHtml */
    describe('loadHtml', function() {
        describe('ajax', function() {
            it('should should make an ajax call', function(done) {
                sinon.stub($, 'ajax')
                    .yieldsTo('success', 'Some File\'s Content');
                sinon.stub(chrome.extension, 'getURL')
                    .returns('chrome://gibberish_id/somefile.html');
                sinon.stub(chrome.runtime.onMessage, 'addListener');

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

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            if ('restore' in $.ajax) { $.ajax.restore(); }
            if ('restore' in chrome.extension.getURL) { chrome.extension.getURL.restore(); }
            if ('restore' in chrome.runtime.onMessage.addListener) { chrome.runtime.onMessage.addListener.restore(); }
        });
    });
})();
