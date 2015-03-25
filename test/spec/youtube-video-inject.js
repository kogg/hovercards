'use strict';

describe('youtube-video', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var injector;
    var trigger;
    var youtubeVideo;
    var youtubeVideoButton;

    beforeEach(function(done) {
        require(['Squire'], function(Squire) {
            new Squire()
                .mock('injector',             injector           = {})
                .mock('trigger',              trigger            = sandbox.stub().returns($('<div></div>')))
                .mock('youtube-video-button', youtubeVideoButton = sandbox.stub().returns($('<div></div>')))
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

        it('should register injectButtonsOnObjectsAndEmbeds on default', function() {
            injector.register.should.have.been.calledWith('default', youtubeVideo.injectButtonsOnObjectsAndEmbeds);
        });

        it('should register injectButtonOnPlayer on youtube-iframe', function() {
            injector.register.should.have.been.calledWith('youtube-iframe', youtubeVideo.injectButtonOnPlayer);
        });

        it('should register injectButtonsOnObjectsAndEmbeds on facebook-youtube-iframe', function() {
            injector.register.should.have.been.calledWith('facebook-youtube-iframe', youtubeVideo.injectButtonsOnObjectsAndEmbeds);
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

    describe('#injectButtonOnPlayer', function() {
        it('should attach youtube-video-button to #player', function() {
            youtubeVideo.injectButtonOnPlayer(body, 'https://youtube.com/embed/SOME_ID');

            youtubeVideoButton.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#player')[0];
            }, 'match with #player'));
            youtubeVideoButton.should.always.have.been.calledWith(sinon.match.any, 'SOME_ID');
        });
    });

    describe('#injectButtonsOnObjectsAndEmbeds', function() {
        it('should attach youtube-video-button to youtube embeds', function() {
            $('<embed id="embed" src="https://www.youtube.com/v/SOME_ID">').appendTo(body);

            youtubeVideo.injectButtonsOnObjectsAndEmbeds(body);

            youtubeVideoButton.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#embed')[0];
            }, 'wasn\'t matched with #embed'));
            youtubeVideoButton.should.always.have.been.calledWith(sinon.match.any, 'SOME_ID');
        });

        it('should attach youtube-video-button to youtube objects', function() {
            $('<object id="object" data="https://www.youtube.com/v/SOME_ID"></object>').appendTo(body);

            youtubeVideo.injectButtonsOnObjectsAndEmbeds(body);

            youtubeVideoButton.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#object')[0];
            }, 'wasn\'t matched with #object'));
            youtubeVideoButton.should.always.have.been.calledWith(sinon.match.any, 'SOME_ID');
        });

        it('should not attach youtube-video-button to other embeds', function() {
            $('<embed id="embed_bad">').appendTo(body);

            youtubeVideo.injectButtonsOnObjectsAndEmbeds(body);

            youtubeVideoButton.should.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#embed_bad')[0];
            }, 'wasn\'t matched with #embed_bad'));
        });

        it('should not attach youtube-video-button to other objects', function() {
            $('<object id="object_bad"></object>').appendTo(body);

            youtubeVideo.injectButtonsOnObjectsAndEmbeds(body);

            youtubeVideoButton.should.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#object_bad')[0];
            }, 'wasn\'t matched with #object_bad'));
        });
    });
});
