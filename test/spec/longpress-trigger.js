'use strict';

describe('longpress-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var longpress_trigger;

    beforeEach(function(done) {
        require(['longpress-trigger'], function(_longpress_trigger) {
            sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime, 'sendMessage');
            sandbox.stub(chrome.storage.sync, 'get');
            sandbox.stub(chrome.storage.sync, 'set');
            chrome.storage.sync.get.yields({ });
            longpress_trigger = _longpress_trigger;
            sandbox.stub(longpress_trigger, 'isActive');
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    describe('.on', function() {
        var obj;
        var get_url_with_args;

        beforeEach(function() {
            body = $('<div id="body"></div>');
            obj = $('<a id="obj" href="https://www.wenoknow.com/"></a>').appendTo(body);
            var get_url = sandbox.stub();
            get_url_with_args = get_url.withArgs(sinon.match(function(_obj) {
                return obj.is(_obj);
            }, 'is obj'));
            get_url_with_args.returns(obj.attr('href'));
            longpress_trigger.on(body, '#obj', get_url);
        });

        describe('on mousedown', function() {
            it('should trigger longpress after 333ms', function(done) {
                obj.on('longpress', function(e, url) {
                    expect(url).to.equal('https://www.wenoknow.com/');
                    done();
                });
                obj.trigger($.Event('mousedown', { which: 1 }));
                longpress_trigger.isActive.returns(true);
                sandbox.clock.tick(333);
            });

            it('should not trigger longpress after 333ms if get_url is null', function() {
                obj.on('longpress', function() {
                    expect(true).to.be.false;
                });
                get_url_with_args.returns(null);
                obj.trigger($.Event('mousedown', { which: 1 }));
                longpress_trigger.isActive.returns(true);
                sandbox.clock.tick(333);
            });

            it('should not trigger longpress after 333ms if which !== 1', function() {
                obj.on('longpress', function() {
                    expect(true).to.be.false;
                });
                obj.trigger($.Event('mousedown', { which: 2 }));
                longpress_trigger.isActive.returns(true);
                sandbox.clock.tick(333);
            });

            it('should not trigger longpress after click > 333ms', function() {
                obj.on('longpress', function() {
                    expect(true).to.be.false;
                });
                obj.trigger($.Event('mousedown', { which: 1 }));
                longpress_trigger.isActive.returns(true);
                obj.trigger($.Event('click', { which: 1 }));
                longpress_trigger.isActive.returns(false);
                sandbox.clock.tick(333);
            });

            it('should trigger longpress on after click[which != 1] > 333ms', function(done) {
                obj.on('longpress', function(e, url) {
                    expect(url).to.equal('https://www.wenoknow.com/');
                    done();
                });
                obj.trigger($.Event('mousedown', { which: 1 }));
                longpress_trigger.isActive.returns(true);
                obj.trigger($.Event('click', { which: 2 }));
                longpress_trigger.isActive.returns(false);
                sandbox.clock.tick(333);
            });

            it('should not trigger longpress after mouseleave > 333ms', function() {
                obj.on('longpress', function() {
                    expect(true).to.be.false;
                });
                obj.trigger($.Event('mousedown', { which: 1 }));
                longpress_trigger.isActive.returns(true);
                obj.mouseleave();
                longpress_trigger.isActive.returns(false);
                sandbox.clock.tick(333);
            });
        });

        describe('on longpress', function() {
            it('should send activate', function() {
                obj.trigger('longpress', ['URL']);
                longpress_trigger.isActive.returns(true);

                expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'activate', url: 'URL' });
            });

            it('should have pointer-events:none && cursor:default', function() {
                obj.trigger('longpress', ['URL']);
                longpress_trigger.isActive.returns(true);

                expect(obj).to.have.css('pointer-events', 'none');
                expect(obj).to.have.css('cursor', 'default');
            });

            it('should have pointer-events/cursor:initial after inactive for 100ms', function() {
                obj.css('pointer-events', 'painted');
                obj.css('cursor', 'none');
                obj.trigger('longpress', ['URL']);
                longpress_trigger.isActive.returns(true);
                sandbox.clock.tick(100);
                longpress_trigger.isActive.returns(false);
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
            it('should send longpressed', function() {
                obj.mouseenter();

                expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'hovered' });
            });
        });
    });
});
