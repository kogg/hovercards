'use strict';

describe('youtube-video-inject', function() {
    var sandbox = sinon.sandbox.create();
    var injector;
    var trigger;
    var youtubeVideoButton;
    var youtubeVideoInject;

    before(function(done) {
        require(['Squire'], function(Squire) {
            injector = new Squire()
                .mock('trigger', function() {
                    return trigger.apply(trigger, arguments);
                })
                .mock('youtube-video-button', function() {
                    return youtubeVideoButton.apply(youtubeVideoButton, arguments);
                });
            done();
        });
    });

    beforeEach(function(done) {
        trigger = sandbox.stub();
        youtubeVideoButton = sandbox.stub().returns($('<div id="button"></div>'));
        injector.require(['youtube-video-inject'], function(_youtubeVideoInject) {
            youtubeVideoInject = _youtubeVideoInject;
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('when on top frame', function() {
        var body;

        beforeEach(function() {
            sandbox.stub(youtubeVideoInject, 'injectButtonsOnObjectsAndEmbeds');
            sandbox.stub(youtubeVideoInject, 'injectTriggersOnLinks');
            body = $('<div id="sandbox"></div>');
            youtubeVideoInject(body);
        });

        it('should call .injectButtonsOnObjectsAndEmbeds', function() {
            youtubeVideoInject.injectButtonsOnObjectsAndEmbeds.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body[0];
            }, 'match with body'));
        });

        it('should call .injectTriggersOnLinks', function() {
            youtubeVideoInject.injectTriggersOnLinks.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body[0];
            }, 'match with body'));
            youtubeVideoInject.injectTriggersOnLinks.should.have.been.calledWith(sinon.match.any, document.URL);
        });
    });

    describe('when inside youtube iframe', function() {
        var body;

        beforeEach(function() {
            sandbox.stub(youtubeVideoInject, 'injectButtonOnPlayer');
            body = $('<div id="sandbox"><div id="player"></div></div>');
            youtubeVideoInject(body, '#player', 'https://youtube.com/embed/SOME_ID');
        });

        it('should call .injectButtonOnPlayer', function() {
            youtubeVideoInject.injectButtonOnPlayer.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body[0];
            }, 'match with body'));
            youtubeVideoInject.injectButtonOnPlayer.should.have.been.calledWith(sinon.match.any, 'https://youtube.com/embed/SOME_ID');
        });
    });

    describe('when inside facebook youtube iframes', function() {
        var body;

        beforeEach(function() {
            sandbox.stub(youtubeVideoInject, 'injectButtonsOnObjectsAndEmbeds');
            body = $('<div id="sandbox"></div>');
            youtubeVideoInject(body, 'objects', 'https://youtube.com/embed/SOME_ID');
        });

        it('should call .injectButtonsOnObjectsAndEmbeds', function() {
            youtubeVideoInject.injectButtonsOnObjectsAndEmbeds.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body[0];
            }, 'match with body'));
        });
    });

    describe('.injectButtonOnPlayer', function() {
        var body;

        beforeEach(function() {
            body = $('<div id="sandbox"><div id="player"></div></div>');
            youtubeVideoInject.injectButtonOnPlayer(body, 'https://youtube.com/embed/SOME_ID');
        });

        it('should attach youtube-video-button to #player', function() {
            youtubeVideoButton.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#player')[0];
            }, 'match with #player'));
            youtubeVideoButton.should.always.have.been.calledWith(sinon.match.any, 'SOME_ID');
        });
    });

    describe('.injectButtonsOnObjectsAndEmbeds', function() {
        it('should attach youtube-video-button to youtube embeds', function() {
            var body = $('<div id="sandbox"></div>');
            $('<embed id="embed" src="https://www.youtube.com/v/SOME_ID">').appendTo(body);

            youtubeVideoInject.injectButtonsOnObjectsAndEmbeds(body);

            youtubeVideoButton.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#embed')[0];
            }, 'wasn\'t matched with #embed'));
            youtubeVideoButton.should.always.have.been.calledWith(sinon.match.any, 'SOME_ID');
        });

        it('should attach youtube-video-button to youtube objects', function() {
            var body = $('<div id="sandbox"></div>');
            $('<object id="object" data="https://www.youtube.com/v/SOME_ID"></object>').appendTo(body);

            youtubeVideoInject.injectButtonsOnObjectsAndEmbeds(body);

            youtubeVideoButton.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#object')[0];
            }, 'wasn\'t matched with #object'));
            youtubeVideoButton.should.always.have.been.calledWith(sinon.match.any, 'SOME_ID');
        });

        it('should not attach youtube-video-button to other embeds', function() {
            var body = $('<div id="sandbox"></div>');
            $('<embed id="embed_bad">').appendTo(body);

            youtubeVideoInject.injectButtonsOnObjectsAndEmbeds(body);

            youtubeVideoButton.should.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#embed_bad')[0];
            }, 'wasn\'t matched with #embed_bad'));
        });

        it('should not attach youtube-video-button to other objects', function() {
            var body = $('<div id="sandbox"></div>');
            $('<object id="object_bad"></object>').appendTo(body);

            youtubeVideoInject.injectButtonsOnObjectsAndEmbeds(body);

            youtubeVideoButton.should.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#object_bad')[0];
            }, 'wasn\'t matched with #object_bad'));
        });
    });

    describe('.injectTriggersOnLinks', function() {
        it('should attach trigger to youtube link', function() {
            var body = $('<div id="sandbox"></div>');
            $('<a id="link" href="https://www.youtube.com/watch?v=SOME_ID">').appendTo(body);

            youtubeVideoInject.injectTriggersOnLinks(body, document.URL);

            trigger.should.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#link')[0];
            }, 'wasn\'t matched with #link'));
            trigger.should.always.have.been.calledWith(sinon.match.any, 'youtube-video', 'SOME_ID');
        });

        it('should not attach trigger to other link', function() {
            var body = $('<div id="sandbox"></div>');
            $('<a id="link_bad" href="https://www.wenoknow.com">').appendTo(body);

            youtubeVideoInject.injectTriggersOnLinks(body, document.URL);

            trigger.should.not.have.been.calledWith(sinon.match(function(value) {
                return value[0] === body.children('#link_bad')[0];
            }, 'wasn\'t matched with #link_bad'));
        });
    });
});
