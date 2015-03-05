'use strict';

define(['load-html', 'sinon'], function(loadHtml, sinon) {
    describe('load-html', function() {
        var sandbox = sinon.sandbox.create();

        describe('ajax', function() {
            it('should should make an ajax call', function(done) {
                var server = sandbox.useFakeServer();
                server.autoRespond = true;
                server.respondWith('chrome://extension_id/somefile.html', 'Some File\'s Content');

                loadHtml('somefile.html', function(data) {
                    server.requests.should.have.length(1);
                    data.should.equal('Some File\'s Content');
                    done();
                });
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
});
