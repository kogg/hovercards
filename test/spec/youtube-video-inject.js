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

        it('should attach youtube-video-button to #player', function() {
            youtubeVideoButton.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#player')[0];
            }, 'wasn\'t matched with #player'));
            youtubeVideoButton.should.always.have.been.calledWith(sinon.match.any, 'QH2-TGUlwu4');
        });
    });

    describe('on "embeds/objects"', function() {
        var body;
        beforeEach(function() {
            body = $('<div id="sandbox"><div id="player"></div></div>');
            $('<embed id="embed" src="https://www.youtube.com/v/QH2-TGUlwu4">').appendTo(body);
            $('<embed id="embed_bad">').appendTo(body);
            $('<object id="object" data="https://www.youtube.com/v/QH2-TGUlwu4"></object>').appendTo(body);
            $('<object id="object_bad"></object>').appendTo(body);
            youtubeVideoInject(body, 'objects');
        });

        it('should attach youtube-video-button to youtube embeds/objects', function() {
            youtubeVideoButton.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#embed')[0];
            }, 'wasn\'t matched with #embed'));
            youtubeVideoButton.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#object')[0];
            }, 'wasn\'t matched with #object'));
            youtubeVideoButton.should.always.have.been.calledWith(sinon.match.any, 'QH2-TGUlwu4');
        });

        it('should not attach youtube-video-button to other embeds/objects', function() {
            youtubeVideoButton.should.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#embed_bad')[0];
            }, 'wasn\'t matched with #embed_bad'));
            youtubeVideoButton.should.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#object_bad')[0];
            }, 'wasn\'t matched with #object_bad'));
        });
    });

    afterEach(function() {
        $('#sandbox').remove();
        sandbox.restore();
    });
});
