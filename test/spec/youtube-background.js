'use strict';

describe('youtube-background', function() {
    var sandbox = sinon.sandbox.create();
    var youtubeBackground;

    beforeEach(function(done) {
        require(['youtube-background'], function(_youtubeBackground) {
            youtubeBackground = _youtubeBackground;
            done();
        });
    });

    describe('when receiving info', function() {
        it('should call the youtube API');

        it('should send youtube info');
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
