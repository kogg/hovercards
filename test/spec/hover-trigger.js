'use strict';

describe('hover-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var link;
    var hover_trigger;

    var activate_msg = { msg: 'activate', url: 'https://www.wenoknow.com/' };

    beforeEach(function(done) {
        require(['hover-trigger'], function(_hover_trigger) {
            sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime, 'sendMessage');
            sandbox.stub(chrome.storage.sync, 'get');
            sandbox.stub(chrome.storage.sync, 'set');
            chrome.storage.sync.get.yields({ });
            hover_trigger = _hover_trigger;
            sandbox.stub(hover_trigger, 'isActive');
            done();
        });
    });

    beforeEach(function() {
        body = $('<div id="body"></div>');
        link = $('<a id="link" href="https://www.wenoknow.com/"></a>').appendTo(body);
        hover_trigger.on(body, '#link', function(_link) {
            return (link[0] === _link[0]) ? 'https://www.wenoknow.com/' : 'nope';
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    describe('longpress', function() {
        it('should send activate on mousedown > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).to.have.been.calledWith(activate_msg);
        });

        it('should not send activate on mousedown[which!=1] > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 2 }));
            hover_trigger.isActive.returns(true);
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).not.to.not.have.been.called;
        });

        it('should not send activate on mousedown > click > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            link.trigger($.Event('click', { which: 1 }));
            hover_trigger.isActive.returns(false);
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).not.to.have.been.called;
        });

        it('should not send activate on mousedown > mouseleave > 333ms', function() {
            link.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            link.mouseleave();
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).not.to.have.been.called;
        });

        describe('prevent other handlers', function() {
            it('should have pointer-events:none on mousedown[which==1] > 333ms', function() {
                link.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);
                sandbox.clock.tick(333);

                expect(link).to.have.css('pointer-events', 'none');
            });

            it('should have pointer-events:none on mousedown[which==1] > 333ms > click > 100ms', function() {
                link.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);
                sandbox.clock.tick(333);
                link.trigger($.Event('click', { which: 1 }));
                hover_trigger.isActive.returns(false);
                sandbox.clock.tick(100);

                expect(link).to.have.css('pointer-events', '');
            });
        });
    });

    describe('on mouseenter', function() {
        it('should send hovered', function() {
            link.mouseenter();

            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'hovered' });
        });
    });

    describe('.relative_to_absolute', function() {
        it('should leave absolute URLs alone', function() {
            expect(hover_trigger.relative_to_absolute('https://www.wenoknow.com/')).to.equal('https://www.wenoknow.com/');
        });

        it('should make relative URLs absolute', function() {
            expect(hover_trigger.relative_to_absolute('/hello')).to.equal('http://localhost:9500/hello');
        });
    });
});
