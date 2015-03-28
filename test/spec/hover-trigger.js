'use strict';

describe('hover-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var link;
    var hoverTrigger;

    beforeEach(function(done) {
        require(['hover-trigger'], function(_hoverTrigger) {
            sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime, 'sendMessage');
            hoverTrigger = _hoverTrigger;
            done();
        });
    });

    beforeEach(function() {
        body = $('<div id="sandbox"></div>');
        link = $('<a id="link" href="SOME_URL"></a>').appendTo(body);
        hoverTrigger.handle(body, 'something', '#link', function() {
            return 'SOME_ID';
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    describe('hover/unhover', function() {
        it('should send msg:hover on mouseenter', function() {
            link.mouseenter();
            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'hover', content: 'something', id: 'SOME_ID' });
        });

        it('should send msg:unhover on mouseleave', function() {
            link.mouseleave();
            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'unhover' });
        });
    });

    describe('longpress', function() {
        it('should send msg:activate mousedown > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            sandbox.clock.tick(333);
            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'activate', content: 'something', id: 'SOME_ID' });
        });

        it('should not send msg:activate mousedown[which!=1] > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 2 }));
            sandbox.clock.tick(333);
            expect(chrome.runtime.sendMessage).to.not.have.been.calledWith({ msg: 'activate', content: 'something', id: 'SOME_ID' });
        });

        it('should not send msg:activate mousedown > click > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            link.trigger($.Event('click', { which: 1 }));
            sandbox.clock.tick(333);
            expect(chrome.runtime.sendMessage).to.not.have.been.calledWith({ msg: 'activate', content: 'something', id: 'SOME_ID' });
        });

        it('should not send msg:activate mousedown > mouseleave > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            link.mouseleave();
            sandbox.clock.tick(333);
            expect(chrome.runtime.sendMessage).to.not.have.been.calledWith({ msg: 'activate', content: 'something', id: 'SOME_ID' });
        });
    });
});
