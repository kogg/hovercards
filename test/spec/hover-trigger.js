'use strict';

describe('hover-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var link;
    var hoverTrigger;

    var activate_msg = { msg: 'activate', network: 'somewhere', type: 'somewhere-something', id: 'SOME_ID' };

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
        body = $('<div id="sandbox"></div>');
        link = $('<a id="link" href="SOME_URL"></a>').appendTo(body);
        hoverTrigger.on(body, 'somewhere', 'somewhere-something', '#link', function() {
            return 'SOME_ID';
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    describe('hover/unhover', function() {
        it('should send hover on mouseenter', function() {
            link.mouseenter();
            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'hover', network: 'somewhere', type: 'somewhere-something', id: 'SOME_ID' });
        });

        it('should send unhover on mouseleave', function() {
            link.mouseleave();
            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'unhover' });
        });
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
            expect(chrome.runtime.sendMessage).to.not.have.been.calledWith(activate_msg);
        });

        it('should not send activate on mousedown > click > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hoverTrigger.isActive.returns(true);
            link.trigger($.Event('click', { which: 1 }));
            hoverTrigger.isActive.returns(false);
            sandbox.clock.tick(333);
            expect(chrome.runtime.sendMessage).to.not.have.been.calledWith(activate_msg);
        });

        it('should not send activate on mousedown > mouseleave > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hoverTrigger.isActive.returns(true);
            link.mouseleave();
            sandbox.clock.tick(333);
            expect(chrome.runtime.sendMessage).to.not.have.been.calledWith(activate_msg);
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
