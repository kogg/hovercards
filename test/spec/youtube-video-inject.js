'use strict';

describe('youtube-video', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var injector;
    var trigger;
    var youtubeVideo;

    beforeEach(function(done) {
        require(['Squire'], function(Squire) {
            new Squire()
                .mock('injector', injector = {})
                .mock('trigger',  trigger  = sandbox.stub().returns($('<div></div>')))
                .require(['youtube-video'], function(_youtubeVideo) {
                    youtubeVideo = _youtubeVideo;
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

    describe('#registerInjections', function() {
        beforeEach(function() {
            injector.register = sandbox.stub();
            youtubeVideo.registerInjections();
        });

        it('should register injectTriggersOnLinks on default', function() {
            injector.register.should.have.been.calledWith('default', youtubeVideo.injectTriggersOnLinks);
        });

        it('should register injectTriggersOnIframes on default', function() {
            injector.register.should.have.been.calledWith('default', youtubeVideo.injectTriggersOnIframes);
        });

        it('should register injectTriggersOnObjectsAndEmbeds on default', function() {
            injector.register.should.have.been.calledWith('default', youtubeVideo.injectTriggersOnObjectsAndEmbeds);
        });

        it('should register injectTriggersOnObjectsAndEmbeds on facebook-youtube-iframe', function() {
            injector.register.should.have.been.calledWith('facebook-youtube-iframe', youtubeVideo.injectTriggersOnObjectsAndEmbeds);
        });
    });

    describe('#injectTriggersOnLinks', function() {
        it('should attach trigger to youtube link', function() {
            $('<a id="link" href="https://www.youtube.com/watch?v=SOME_ID">').appendTo(body);

            youtubeVideo.injectTriggersOnLinks(body);

            trigger.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#link')[0];
            }, 'wasn\'t matched with #link'));
            trigger.should.always.have.been.calledWith(sinon.match.any, 'youtube-video', 'SOME_ID');
        });

        it('should not attach trigger to other link', function() {
            $('<a id="link_bad" href="https://www.wenoknow.com">').appendTo(body);

            youtubeVideo.injectTriggersOnLinks(body);

            trigger.should.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#link_bad')[0];
            }, 'wasn\'t matched with #link_bad'));
        });
    });

    describe('#injectTriggersOnIframes', function() {
        it('should attach trigger to youtube iframes', function() {
            $('<iframe id="iframe" src="https://www.youtube.com/embed/SOME_ID">').appendTo(body);

            youtubeVideo.injectTriggersOnIframes(body);

            trigger.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('iframe')[0];
            }, 'wasn\'t matched with #iframe'));
            trigger.should.always.have.been.calledWith(sinon.match.any, 'youtube-video', 'SOME_ID');
        });

        it('should not attach trigger to other iframes', function() {
            $('<iframe id="iframe_bad" src="https://www.wenoknow.com">').appendTo(body);

            youtubeVideo.injectTriggersOnLinks(body);

            trigger.should.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#iframe_bad')[0];
            }, 'wasn\'t matched with #iframe_bad'));
        });
    });

    describe('#injectTriggersOnObjectsAndEmbeds', function() {
        it('should attach youtube-video-button to youtube embeds', function() {
            $('<embed id="embed" src="https://www.youtube.com/v/SOME_ID">').appendTo(body);

            youtubeVideo.injectTriggersOnObjectsAndEmbeds(body);

            trigger.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#embed')[0];
            }, 'wasn\'t matched with #embed'));
            trigger.should.always.have.been.calledWith(sinon.match.any, 'youtube-video', 'SOME_ID');
        });

        it('should attach youtube-video-button to youtube objects', function() {
            $('<object id="object" data="https://www.youtube.com/v/SOME_ID"></object>').appendTo(body);

            youtubeVideo.injectTriggersOnObjectsAndEmbeds(body);

            trigger.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#object')[0];
            }, 'wasn\'t matched with #object'));
            trigger.should.always.have.been.calledWith(sinon.match.any, 'youtube-video', 'SOME_ID');
        });

        it('should not attach youtube-video-button to other embeds', function() {
            $('<embed id="embed_bad">').appendTo(body);

            youtubeVideo.injectTriggersOnObjectsAndEmbeds(body);

            trigger.should.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#embed_bad')[0];
            }, 'wasn\'t matched with #embed_bad'));
        });

        it('should not attach youtube-video-button to other objects', function() {
            $('<object id="object_bad"></object>').appendTo(body);

            youtubeVideo.injectTriggersOnObjectsAndEmbeds(body);

            trigger.should.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#object_bad')[0];
            }, 'wasn\'t matched with #object_bad'));
        });
    });
});
