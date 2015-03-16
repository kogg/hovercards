'use strict';

describe('youtube-video-inject', function() {
    var sandbox = sinon.sandbox.create();
    var Squire;
    var trigger;
    var youtubeVideoButton;
    var youtubeVideoInject;

    before(function(done) {
        require(['Squire'], function(_Squire) {
            Squire = _Squire;
            done();
        });
    });

    beforeEach(function(done) {
        new Squire()
            .mock('trigger', trigger = sandbox.stub().returnsArg(0))
            .mock('youtube-video-button', youtubeVideoButton = sandbox.stub().returns($('<div id="button"></div>')))
            .require(['youtube-video-inject'], function(_youtubeVideoInject) {
                youtubeVideoInject = _youtubeVideoInject;
                done();
            });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('inside youtube iframe', function() {
        var body;
        beforeEach(function() {
            body = $('<div id="sandbox"><div id="player"></div></div>');
            youtubeVideoInject(body, '#player', 'https://youtube.com/embed/QH2-TGUlwu4');
        });

        it('attaches youtube-video-button to #player', function() {
            youtubeVideoButton.should.have.been.calledWith(sinon.match(body.children('#player')));
            youtubeVideoButton.should.have.been.calledWith(sinon.match.any, 'QH2-TGUlwu4');
        });
    });

    afterEach(function() {
        $('#sandbox').remove();
        sandbox.restore();
    });
});
