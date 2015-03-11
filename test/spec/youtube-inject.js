'use strict';

describe('youtube-inject', function() {
    var sandbox = sinon.sandbox.create();
    var youtubeInject;

    beforeEach(function(done) {
        require(['youtube-inject'], function(_youtubeInject) {
            youtubeInject = _youtubeInject;
            done();
        });
    });

    it('should have some tests');

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
