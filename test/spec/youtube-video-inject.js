'use strict';

describe('youtube-video-inject', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var trigger;
    var youtubeVideoInject;

    beforeEach(function(done) {
        require(['Squire'], function(Squire) {
            new Squire()
                .mock('trigger', trigger = sandbox.stub().returns($('<div></div>')))
                .require(['youtube-video-inject'], function(_youtubeVideoInject) {
                    youtubeVideoInject = _youtubeVideoInject;
                    done();
                });
        });
    });

    beforeEach(function() {
        body = $('<div id="sandbox"></div>');
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should call injectTriggersOnLinks with default context', function() {
        sandbox.stub(youtubeVideoInject, 'injectTriggersOnLinks');
        youtubeVideoInject('default');
        expect(youtubeVideoInject.injectTriggersOnLinks).to.have.been.called;
    });

    it('should call injectTriggerOnIframePlayer with youtube-iframe context', function() {
        sandbox.stub(youtubeVideoInject, 'injectTriggerOnIframePlayer');
        youtubeVideoInject('youtube-iframe');
        expect(youtubeVideoInject.injectTriggerOnIframePlayer).to.have.been.called;
    });

    it('should call injectTriggersOnObjectsAndEmbeds with default context', function() {
        sandbox.stub(youtubeVideoInject, 'injectTriggersOnObjectsAndEmbeds');
        youtubeVideoInject('default');
        expect(youtubeVideoInject.injectTriggersOnObjectsAndEmbeds).to.have.been.called;
    });

    it('should call injectTriggersOnObjectsAndEmbeds with facebook-youtube-iframe context', function() {
        sandbox.stub(youtubeVideoInject, 'injectTriggersOnObjectsAndEmbeds');
        youtubeVideoInject('facebook-youtube-iframe');
        expect(youtubeVideoInject.injectTriggersOnObjectsAndEmbeds).to.have.been.called;
    });

    describe('#injectTriggersOnLinks', function() {
        it('should attach trigger to youtube links', function() {
            $('<a id="link" href="https://www.youtube.com/watch?v=SOME_ID">').appendTo(body);

            youtubeVideoInject.injectTriggersOnLinks(body);

            expect(trigger).to.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#link')[0];
            }, 'wasn\'t matched with #link'));
            expect(trigger).to.always.have.been.calledWith(sinon.match.any, 'youtube-video', 'SOME_ID');
        });

        it('should not attach trigger to other links', function() {
            $('<a id="link_bad" href="https://www.wenoknow.com">').appendTo(body);

            youtubeVideoInject.injectTriggersOnLinks(body);

            expect(trigger).to.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#link_bad')[0];
            }, 'wasn\'t matched with #link_bad'));
        });
    });

    describe('#injectTriggerOnIframePlayer', function() {
        it('should attach trigger to youtube player', function() {
            $('<div id="player"></div>>').appendTo(body);

            youtubeVideoInject.injectTriggerOnIframePlayer(body, 'https://www.youtube.com/embed/SOME_ID');

            expect(trigger).to.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#player')[0];
            }, 'wasn\'t matched with #player'));
            expect(trigger).to.always.have.been.calledWith(sinon.match.any, 'youtube-video', 'SOME_ID');
        });
    });

    describe('#injectTriggersOnObjectsAndEmbeds', function() {
        it('should attach youtube-video-button to youtube embeds', function() {
            $('<embed id="embed" src="https://www.youtube.com/v/SOME_ID">').appendTo(body);

            youtubeVideoInject.injectTriggersOnObjectsAndEmbeds(body);

            expect(trigger).to.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#embed')[0];
            }, 'wasn\'t matched with #embed'));
            expect(trigger).to.always.have.been.calledWith(sinon.match.any, 'youtube-video', 'SOME_ID');
        });

        it('should attach youtube-video-button to youtube objects', function() {
            $('<object id="object" data="https://www.youtube.com/v/SOME_ID"></object>').appendTo(body);

            youtubeVideoInject.injectTriggersOnObjectsAndEmbeds(body);

            expect(trigger).to.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#object')[0];
            }, 'wasn\'t matched with #object'));
            expect(trigger).to.always.have.been.calledWith(sinon.match.any, 'youtube-video', 'SOME_ID');
        });

        it('should not attach youtube-video-button to other embeds', function() {
            $('<embed id="embed_bad">').appendTo(body);

            youtubeVideoInject.injectTriggersOnObjectsAndEmbeds(body);

            expect(trigger).to.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#embed_bad')[0];
            }, 'wasn\'t matched with #embed_bad'));
        });

        it('should not attach youtube-video-button to other objects', function() {
            $('<object id="object_bad"></object>').appendTo(body);

            youtubeVideoInject.injectTriggersOnObjectsAndEmbeds(body);

            expect(trigger).to.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#object_bad')[0];
            }, 'wasn\'t matched with #object_bad'));
        });
    });
});
