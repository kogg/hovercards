'use strict';

describe('youtube-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['youtube-background'], function(youtubeBackground) {
            youtubeBackground();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should have a test', function() {
    });
});
