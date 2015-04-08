'use strict';

describe('hover-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var obj;
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
        obj = $('<a id="obj" href="https://www.wenoknow.com/"></a>').appendTo(body);
        hover_trigger.on(body, '#obj', function(_obj) {
            return (obj[0] === _obj[0]) ? obj.attr('href') : 'nope';
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    describe('longpress', function() {
        it('should send activate on mousedown > 333ms', function() {
            obj.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).to.have.been.calledWith(activate_msg);
        });

        it('should not send activate on mousedown > 333ms if url is a javascript:function', function() {
            /*jshint scripturl:true*/
            obj.attr('href', 'javascript:void(0)');
            obj.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).not.to.have.been.called;
        });

        it('should not send activate on mousedown[which!=1] > 333ms', function() {
            obj.trigger($.Event('mousedown', { which: 2 }));
            hover_trigger.isActive.returns(true);
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).not.to.not.have.been.called;
        });

        it('should not send activate on mousedown > click > 333ms', function() {
            obj.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            obj.trigger($.Event('click', { which: 1 }));
            hover_trigger.isActive.returns(false);
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).not.to.have.been.called;
        });

        it('should not send activate on mousedown > mouseleave > 333ms', function() {
            obj.trigger($.Event('mousedown', { which: 1 }));
            hover_trigger.isActive.returns(true);
            obj.mouseleave();
            sandbox.clock.tick(333);

            expect(chrome.runtime.sendMessage).not.to.have.been.called;
        });

        describe('prevent other handlers', function() {
            it('should have pointer-events:default on mousedown', function() {
                obj.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);

                expect(obj).to.have.css('pointer-events', '');
            });

            it('should have pointer-events:none on mousedown > 333ms', function() {
                obj.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);
                sandbox.clock.tick(333);

                expect(obj).to.have.css('pointer-events', 'none');
            });

            it('should have pointer-events:default on mousedown > 333ms > click > 100ms', function() {
                obj.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);
                sandbox.clock.tick(333);
                obj.trigger($.Event('click', { which: 1 }));
                hover_trigger.isActive.returns(false);
                sandbox.clock.tick(100);

                expect(obj).to.have.css('pointer-events', '');
            });

            it('should run other click handlers on mousedown > click', function(done) {
                obj.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);
                obj.click(function() {
                    done();
                });
                obj.trigger($.Event('click', { which: 1 }));
            });

            it('should not have prevented default or stopped immediate propagation on mousedown > 333ms > click', function() {
                obj.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);
                obj.click(function() {
                    expect(true).to.be.false;
                });
                sandbox.clock.tick(333);
                obj.trigger($.Event('click', { which: 1 }));
            });
        });
    });

    describe('on mouseenter', function() {
        it('should send hovered', function() {
            obj.mouseenter();

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
