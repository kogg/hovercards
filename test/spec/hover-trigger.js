'use strict';

describe('hover-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var link;
    var hoverTrigger;

    var activate_msg = { msg: 'activate', url: 'URL' };

    beforeEach(function(done) {
        require(['hover-trigger'], function(_hoverTrigger) {
            sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime, 'sendMessage');
            hoverTrigger = _hoverTrigger;
            sandbox.stub(hoverTrigger, 'isActive');
            done();
        });
    });

    beforeEach(function() {
        body = $('<div id="body"></div>');
        link = $('<a id="link" href="URL"></a>').appendTo(body);
        hoverTrigger.on(body, '#link', function(_link) {
            return (link[0] === _link[0]) ? 'URL' : 'nope';
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    describe('longpress', function() {
        it('should send activate on mousedown > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hoverTrigger.isActive.returns(true);
            sandbox.clock.tick(333);
            expect(chrome.runtime.sendMessage).to.have.been.calledWith(activate_msg);
        });

        it('should not send activate on mousedown[which!=1] > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 2 }));
            hoverTrigger.isActive.returns(true);
            sandbox.clock.tick(333);
            expect(chrome.runtime.sendMessage).not.to.not.have.been.called;
        });

        it('should not send activate on mousedown > click > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hoverTrigger.isActive.returns(true);
            link.trigger($.Event('click', { which: 1 }));
            hoverTrigger.isActive.returns(false);
            sandbox.clock.tick(333);
            expect(chrome.runtime.sendMessage).not.to.have.been.called;
        });

        it('should not send activate on mousedown > mouseleave > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hoverTrigger.isActive.returns(true);
            link.mouseleave();
            sandbox.clock.tick(333);
            expect(chrome.runtime.sendMessage).not.to.have.been.called;
        });
    });

    describe('prevent other handlers', function() {
        it('should have pointer-events:none on mousedown[which==1] > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hoverTrigger.isActive.returns(true);
            sandbox.clock.tick(333);
            expect(link).to.have.css('pointer-events', 'none');
        });

        it('should have pointer-events:none on mousedown[which==1] > 333ms > click > 100ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hoverTrigger.isActive.returns(true);
            sandbox.clock.tick(333);
            link.trigger($.Event('click', { which: 1 }));
            hoverTrigger.isActive.returns(false);
            sandbox.clock.tick(100);
            expect(link).to.have.css('pointer-events', '');
        });
    });
});
