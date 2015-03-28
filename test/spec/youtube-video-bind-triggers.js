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

    describe('on a[href="https://www.youtube.com/watch?v=SOME_ID"]', function() {
        var element;
        var selector;

        beforeEach(function() {
            element = $('<a href="https://www.youtube.com/watch?v=SOME_ID">').appendTo(body);
            youtubeVideoBindTriggers(body);
        });

        it('should be handled by hoverTrigger', function() {
            expect(hoverTrigger.handle).to.be.calledWith(body, 'youtube-video', sinon.match(function(_selector) {
                selector = _selector;
                return body.find(selector)[0] === element[0];
            }, 'matches element'));
        });

        it('should parse ID', function() {
            var args = hoverTrigger.handle.withArgs(body, 'youtube-video', selector).args[0];
            expect(args[3].call(element)).to.equal('SOME_ID');
        });
    });

    describe('on embed[src="https://www.youtube.com/v/SOME_ID"]', function() {
        var element;
        var selector;

        beforeEach(function() {
            element = $('<embed src="https://www.youtube.com/v/SOME_ID">').appendTo(body);
            youtubeVideoBindTriggers(body);
        });

        it('should be handled by hoverTrigger', function() {
            expect(hoverTrigger.handle).to.be.calledWith(body, 'youtube-video', sinon.match(function(_selector) {
                selector = _selector;
                return body.find(selector)[0] === element[0];
            }, 'matches element'));
        });

        it('should parse ID', function() {
            var args = hoverTrigger.handle.withArgs(body, 'youtube-video', selector).args[0];
            expect(args[3].call(element)).to.equal('SOME_ID');
        });
    });

    describe('on object[data="https://www.youtube.com/v/SOME_ID"]', function() {
        var element;
        var selector;

        beforeEach(function() {
            element = $('<object data="https://www.youtube.com/v/SOME_ID"></object>').appendTo(body);
            youtubeVideoBindTriggers(body);
        });

        it('should be handled by hoverTrigger', function() {
            expect(hoverTrigger.handle).to.be.calledWith(body, 'youtube-video', sinon.match(function(_selector) {
                selector = _selector;
                return body.find(selector)[0] === element[0];
            }, 'matches element'));
        });

        it('should parse ID', function() {
            var args = hoverTrigger.handle.withArgs(body, 'youtube-video', selector).args[0];
            expect(args[3].call(element)).to.equal('SOME_ID');
        });
    });
});
