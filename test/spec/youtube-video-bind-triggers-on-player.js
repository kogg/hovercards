'use strict';

describe('youtube-video-bind-triggers-on-player', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var youtubeVideoBindTriggersOnPlayer;
    var hoverTrigger;

    beforeEach(function(done) {
        require(['youtube-video-bind-triggers-on-player', 'hover-trigger'], function(_youtubeVideoBindTriggersOnPlayer, _hoverTrigger) {
            youtubeVideoBindTriggersOnPlayer = _youtubeVideoBindTriggersOnPlayer;
            hoverTrigger = _hoverTrigger;
            sandbox.stub(hoverTrigger, 'handle');
            done();
        });
    });

    beforeEach(function() {
        body = $('<div id="sandbox"></div>');
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    describe('on video element', function() {
        var element;
        var selector;

        beforeEach(function() {
            var player = $('<div id="player"></div>').appendTo(body);
            element = $('<div class="html5-video-container"></div>').appendTo(player);
            youtubeVideoBindTriggersOnPlayer(body, 'SOME_ID');
        });

        it('should be handled by hoverTrigger', function() {
            expect(hoverTrigger.handle).to.be.calledWith(
                sinon.match(function(thing) {
                    return body[0] === thing[0];
                }, 'matches element'),
                'youtube-video',
                sinon.match(function(_selector) {
                    selector = _selector;
                    return body.find(selector)[0] === element[0];
                }, 'matches element'));
        });

        it('should parse ID', function() {
            var args = hoverTrigger.handle.withArgs(sinon.match(function(thing) {
                return body[0] === thing[0];
            }, 'matches element'), 'youtube-video', selector).args[0];
            expect(args[3].call(element)).to.equal('SOME_ID');
        });
    });
});
