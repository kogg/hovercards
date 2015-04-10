'use strict';

describe('hover-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var hover_trigger;

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

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    describe('.on', function() {
        var obj;

        beforeEach(function() {
            body = $('<div id="body"></div>');
            obj = $('<a id="obj" href="https://www.wenoknow.com/"></a>').appendTo(body);
            hover_trigger.on(body, '#obj', function(_obj) {
                return (obj[0] === _obj[0]) ? obj.attr('href') : 'nope';
            });
        });

        describe('on mousedown', function() {
            it('should trigger longpress after 333ms', function(done) {
                obj.on('longpress', function(e, url) {
                    expect(url).to.equal('https://www.wenoknow.com/');
                    done();
                });
                obj.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);
                sandbox.clock.tick(333);
            });

            it('should not trigger longpress after 333ms if .get_url is null', function() {
                obj.on('longpress', function() {
                    expect(true).to.be.false;
                });
                sandbox.stub(hover_trigger, 'get_url').returns(null);
                obj.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);
                sandbox.clock.tick(333);
            });

            it('should not trigger longpress after 333ms if which !== 1', function() {
                obj.on('longpress', function() {
                    expect(true).to.be.false;
                });
                obj.trigger($.Event('mousedown', { which: 2 }));
                hover_trigger.isActive.returns(true);
                sandbox.clock.tick(333);
            });

            it('should not trigger longpress after click > 333ms', function() {
                obj.on('longpress', function() {
                    expect(true).to.be.false;
                });
                obj.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);
                obj.trigger($.Event('click', { which: 1 }));
                hover_trigger.isActive.returns(false);
                sandbox.clock.tick(333);
            });

            it('should trigger longpress on after click[which != 1] > 333ms', function(done) {
                obj.on('longpress', function(e, url) {
                    expect(url).to.equal('https://www.wenoknow.com/');
                    done();
                });
                obj.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);
                obj.trigger($.Event('click', { which: 2 }));
                hover_trigger.isActive.returns(false);
                sandbox.clock.tick(333);
            });

            it('should not trigger longpress after mouseleave > 333ms', function() {
                obj.on('longpress', function() {
                    expect(true).to.be.false;
                });
                obj.trigger($.Event('mousedown', { which: 1 }));
                hover_trigger.isActive.returns(true);
                obj.mouseleave();
                hover_trigger.isActive.returns(false);
                sandbox.clock.tick(333);
            });
        });

        describe('on longpress', function() {
            it('should send activate', function() {
                obj.trigger('longpress', ['URL']);
                hover_trigger.isActive.returns(true);

                expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'activate', url: 'URL' });
            });

            it('should have pointer-events:none && cursor:default', function() {
                obj.trigger('longpress', ['URL']);
                hover_trigger.isActive.returns(true);

                expect(obj).to.have.css('pointer-events', 'none');
                expect(obj).to.have.css('cursor', 'default');
            });

            it('should have pointer-events/cursor:initial after inactive for 100ms', function() {
                obj.css('pointer-events', 'painted');
                obj.css('cursor', 'none');
                obj.trigger('longpress', ['URL']);
                hover_trigger.isActive.returns(true);
                sandbox.clock.tick(100);
                hover_trigger.isActive.returns(false);
                sandbox.clock.tick(100);

                expect(obj).to.have.css('pointer-events', 'painted');
                expect(obj).to.have.css('cursor', 'none');
            });

            it('should preventClickEvents on click', function() {
                obj.trigger('longpress', ['URL']);
                obj.click(function() {
                    expect(true).to.be.false;
                });
                obj.trigger($.Event('click', { which: 1 }));
            });

            it('should prevent other clicks on click', function(done) {
                obj.trigger('longpress', ['URL']);
                obj.click(function() {
                    done();
                });
                obj.trigger($.Event('click', { which: 2 }));
            });
        });

        describe('on mouseenter', function() {
            it('should send hovered', function() {
                obj.mouseenter();

                expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'hovered' });
            });
        });
    });

    // TODO test .get_url

    describe('.relative_to_absolute', function() {
        it('should leave absolute URLs alone', function() {
            expect(hover_trigger.relative_to_absolute('https://www.wenoknow.com/')).to.equal('https://www.wenoknow.com/');
        });

        it('should make relative URLs absolute', function() {
            expect(hover_trigger.relative_to_absolute('/hello')).to.equal('http://localhost:9500/hello');
        });
    });
});
