'use strict';

describe('trigger-inject', function() {
    var sandbox;
    var body;
    var trigger_inject;
    var hover_trigger;

    beforeEach(function(done) {
        require(['trigger-inject', 'hover-trigger'], function(_trigger_inject, _hover_trigger) {
            sandbox = sinon.sandbox.create();
            body = $('<div id="body"></div>');
            trigger_inject = _trigger_inject;
            hover_trigger = _hover_trigger;
            sandbox.stub(hover_trigger, 'on');
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    it('should bind to a[href]', function() {
        var obj = $('<a href="URL">Some Link</a>').appendTo(body);
        trigger_inject.on(body);

        expect(hover_trigger.on).to.be.calledWith(
            sinon.match(function(element) {
                return body.is(element);
            }, 'body'),
            sinon.match(function(selector) {
                return body.find(selector).is(obj);
            }, 'a[href]'),
            sinon.match(function(func) {
                return func(obj) === 'URL';
            }, 'func that gets href')
        );
    });

    it('should bind to a[data-href]', function() {
        var obj = $('<a data-href="URL">Some Link</a>').appendTo(body);
        trigger_inject.on(body);

        expect(hover_trigger.on).to.be.calledWith(
            sinon.match(function(element) {
                return body.is(element);
            }, 'body'),
            sinon.match(function(selector) {
                return body.find(selector).is(obj);
            }, 'a[data-href]'),
            sinon.match(function(func) {
                return func(obj) === 'URL';
            }, 'func that gets data-href')
        );
    });

    it('should bind to embed', function() {
        var obj = $('<embed src="URL">').appendTo(body);
        trigger_inject.on(body);

        expect(hover_trigger.on).to.be.calledWith(
            sinon.match(function(element) {
                return body.is(element);
            }, 'body'),
            sinon.match(function(selector) {
                return body.find(selector).is(obj);
            }, 'embed[src]'),
            sinon.match(function(func) {
                return func(obj) === 'URL';
            }, 'func that gets src')
        );
    });

    it('should bind to object', function() {
        var obj = $('<object data="URL"></object>').appendTo(body);
        trigger_inject.on(body);

        expect(hover_trigger.on).to.be.calledWith(
            sinon.match(function(element) {
                return body.is(element);
            }, 'body'),
            sinon.match(function(selector) {
                return body.find(selector).is(obj);
            }, 'object[data]'),
            sinon.match(function(func) {
                return func(obj) === 'URL';
            }, 'func that gets data')
        );
    });

    it('should bind to youtube video', function() {
        var obj = $('<video class="html5-main-video"></video>')
            .appendTo(body)
            .wrap('<div id="player"><div class="html5-video-player"><div class="html5-video-container"></div></div></div>');
        trigger_inject.on(body);

        expect(hover_trigger.on).to.be.calledWith(
            sinon.match(function(element) {
                return body.is(element);
            }, 'body'),
            sinon.match(function(selector) {
                return body.find(selector).is(obj);
            }, 'youtube video'),
            sinon.match(function(func) {
                return func(obj) === document.URL;
            }, 'func that gets document.URL')
        );
    });
});
