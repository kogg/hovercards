'use strict';

describe('youtube-video-bind-triggers', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var youtubeVideoBindTriggers;
    var hoverTrigger;

    beforeEach(function(done) {
        require(['youtube-video-bind-triggers', 'hover-trigger'], function(_youtubeVideoBindTriggers, _hoverTrigger) {
            youtubeVideoBindTriggers = _youtubeVideoBindTriggers;
            hoverTrigger = _hoverTrigger;
            sandbox.stub(hoverTrigger, 'on');
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

    describe('on a[href="https://www.youtube.com/watch?v=SOME_ID"]', function() {
        var element;
        var selector;

        beforeEach(function() {
            element = $('<a href="https://www.youtube.com/watch?v=SOME_ID">Some Text</a>').appendTo(body);
            youtubeVideoBindTriggers.on(body);
        });

        it('should be handled by hoverTrigger', function() {
            expect(hoverTrigger.on).to.be.calledWith(
                sinon.match(function(thing) {
                    return body[0] === thing[0];
                }, 'matches element'),
                'youtube',
                'video',
                sinon.match(function(_selector) {
                    selector = _selector;
                    return body.find(selector)[0] === element[0];
                }, 'matches element'));
        });

        it('should parse ID', function() {
            var args = hoverTrigger.on.withArgs(sinon.match(function(thing) {
                return body[0] === thing[0];
            }, 'matches element'), 'youtube', 'video', selector).args[0];
            expect(args[4].call(element)).to.equal('SOME_ID');
        });
    });

    describe('on a[href="https://www.youtube.com/watch?v=SOME_ID"] that change href to data-href', function() {
        var element;
        var selector;

        beforeEach(function() {
            element = $('<a href="https://www.youtube.com/watch?v=SOME_ID">Some Text</a>').appendTo(body);
            element.attr('data-href', element.attr('href'));
            element.attr('href', 'FOO');
            youtubeVideoBindTriggers.on(body);
        });

        it('should be handled by hoverTrigger', function() {
            expect(hoverTrigger.on).to.be.calledWith(
                sinon.match(function(thing) {
                    return body[0] === thing[0];
                }, 'matches element'),
                'youtube',
                'video',
                sinon.match(function(_selector) {
                    selector = _selector;
                    return body.find(selector)[0] === element[0];
                }, 'matches element'));
        });

        it('should parse ID', function() {
            var args = hoverTrigger.on.withArgs(sinon.match(function(thing) {
                return body[0] === thing[0];
            }, 'matches element'), 'youtube', 'video', selector).args[0];
            expect(args[4].call(element)).to.equal('SOME_ID');
        });
    });

    describe('on a[href="/watch?v=SOME_ID"] on youtube.com', function() {
        var element;
        var selector;

        beforeEach(function() {
            element = $('<a href="/watch?v=SOME_ID">Some Text</a>').appendTo(body);
            youtubeVideoBindTriggers.on(body, 'https://www.youtube.com/');
        });

        it('should be handled by hoverTrigger', function() {
            expect(hoverTrigger.on).to.be.calledWith(
                sinon.match(function(thing) {
                    return body[0] === thing[0];
                }, 'matches element'),
                'youtube',
                'video',
                sinon.match(function(_selector) {
                    selector = _selector;
                    return body.find(selector)[0] === element[0];
                }, 'matches element'));
        });

        it('should parse ID', function() {
            var args = hoverTrigger.on.withArgs(sinon.match(function(thing) {
                return body[0] === thing[0];
            }, 'matches element'), 'youtube', 'video', selector).args[0];
            expect(args[4].call(element)).to.equal('SOME_ID');
        });
    });

    describe('on video element on youtube.com', function() {
        var youtubeVideoBindTriggersOnPlayer;

        beforeEach(function(done) {
            require(['youtube-video-bind-triggers-on-player'], function(_youtubeVideoBindTriggersOnPlayer) {
                youtubeVideoBindTriggersOnPlayer = _youtubeVideoBindTriggersOnPlayer;
                sandbox.stub(youtubeVideoBindTriggersOnPlayer, 'on');
                done();
            });
        });

        beforeEach(function() {
            youtubeVideoBindTriggers.on(body, 'https://www.youtube.com/watch?v=SOME_ID');
        });

        it('should be handled by youtubeVideoBindTriggersOnPlayer', function() {
            expect(youtubeVideoBindTriggersOnPlayer.on).to.be.calledWith(
                sinon.match(function(thing) {
                    return body[0] === thing[0];
                }, 'matches element'),
                'SOME_ID');
        });
    });

    describe('on a[href="https://youtu.be/SOME_ID"]', function() {
        var element;
        var selector;

        beforeEach(function() {
            element = $('<a href="https://www.youtu.be/SOME_ID">Some Text</a>').appendTo(body);
            youtubeVideoBindTriggers.on(body);
        });

        it('should be handled by hoverTrigger', function() {
            expect(hoverTrigger.on).to.be.calledWith(
                sinon.match(function(thing) {
                    return body[0] === thing[0];
                }, 'matches element'),
                'youtube',
                'video',
                sinon.match(function(_selector) {
                    selector = _selector;
                    return body.find(selector)[0] === element[0];
                }, 'matches element'));
        });

        it('should parse ID', function() {
            var args = hoverTrigger.on.withArgs(sinon.match(function(thing) {
                return body[0] === thing[0];
            }, 'matches element'), 'youtube', 'video', selector).args[0];
            expect(args[4].call(element)).to.equal('SOME_ID');
        });
    });

    describe('on embed[src="https://www.youtube.com/v/SOME_ID"]', function() {
        var element;
        var selector;

        beforeEach(function() {
            element = $('<embed src="https://www.youtube.com/v/SOME_ID">').appendTo(body);
            youtubeVideoBindTriggers.on(body);
        });

        it('should be handled by hoverTrigger', function() {
            expect(hoverTrigger.on).to.be.calledWith(
                sinon.match(function(thing) {
                    return body[0] === thing[0];
                }, 'matches element'),
                'youtube',
                'video',
                sinon.match(function(_selector) {
                    selector = _selector;
                    return body.find(selector)[0] === element[0];
                }, 'matches element'));
        });

        it('should parse ID', function() {
            var args = hoverTrigger.on.withArgs(sinon.match(function(thing) {
                return body[0] === thing[0];
            }, 'matches element'), 'youtube', 'video', selector).args[0];
            expect(args[4].call(element)).to.equal('SOME_ID');
        });
    });

    describe('on object[data="https://www.youtube.com/v/SOME_ID"]', function() {
        var element;
        var selector;

        beforeEach(function() {
            element = $('<object data="https://www.youtube.com/v/SOME_ID"></object>').appendTo(body);
            youtubeVideoBindTriggers.on(body);
        });

        it('should be handled by hoverTrigger', function() {
            expect(hoverTrigger.on).to.be.calledWith(
                sinon.match(function(thing) {
                    return body[0] === thing[0];
                }, 'matches element'),
                'youtube',
                'video',
                sinon.match(function(_selector) {
                    selector = _selector;
                    return body.find(selector)[0] === element[0];
                }, 'matches element'));
        });

        it('should parse ID', function() {
            var args = hoverTrigger.on.withArgs(sinon.match(function(thing) {
                return body[0] === thing[0];
            }, 'matches element'), 'youtube', 'video', selector).args[0];
            expect(args[4].call(element)).to.equal('SOME_ID');
        });
    });
});
