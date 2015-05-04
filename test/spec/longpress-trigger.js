var $ = require('jquery');

describe('longpress-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var get_url_with_args;
    var longpress_trigger;
    var obj;
    var sendMessage;

    beforeEach(function() {
        longpress_trigger = require('./scripts/longpress-trigger');
        sandbox.useFakeTimers();
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    beforeEach(function() {
        body = $('<div id="body"></div>');
        obj = $('<a id="obj" href="https://www.wenoknow.com/"></a>').appendTo(body);
        var get_url = sandbox.stub();
        get_url_with_args = get_url.withArgs(sinon.match(function(_obj) {
            return obj.is(_obj);
        }, 'is obj'));
        get_url_with_args.returns(obj.attr('href'));
        longpress_trigger(body, '#obj', get_url, sendMessage = sandbox.spy());
    });

    describe('on mousedown', function() {
        it('should trigger longpress after 333ms', function(done) {
            obj.on('longpress', function(e, url) {
                expect(url).to.equal('https://www.wenoknow.com/');
                done();
            });
            obj.trigger($.Event('mousedown', { which: 1 }));
            sandbox.stub(require('./scripts/common'), 'is_active').returns(true);
            sandbox.clock.tick(333);
        });

        it('should not trigger longpress after 333ms if get_url is null', function() {
            obj.on('longpress', function() {
                expect(true).to.be.false;
            });
            get_url_with_args.returns(null);
            obj.trigger($.Event('mousedown', { which: 1 }));
            sandbox.stub(require('./scripts/common'), 'is_active').returns(true);
            sandbox.clock.tick(333);
        });

        it('should not trigger longpress after 333ms if which !== 1', function() {
            obj.on('longpress', function() {
                expect(true).to.be.false;
            });
            obj.trigger($.Event('mousedown', { which: 2 }));
            sandbox.stub(require('./scripts/common'), 'is_active').returns(true);
            sandbox.clock.tick(333);
        });

        it('should not trigger longpress after click > 333ms', function() {
            sandbox.stub(require('./scripts/common'), 'is_active');
            obj.on('longpress', function() {
                expect(true).to.be.false;
            });
            obj.trigger($.Event('mousedown', { which: 1 }));
            require('./scripts/common').is_active.returns(true);
            obj.trigger($.Event('click', { which: 1 }));
            require('./scripts/common').is_active.returns(false);
            sandbox.clock.tick(333);
        });

        it('should trigger longpress on after click[which != 1] > 333ms', function(done) {
            sandbox.stub(require('./scripts/common'), 'is_active');
            obj.on('longpress', function(e, url) {
                expect(url).to.equal('https://www.wenoknow.com/');
                done();
            });
            obj.trigger($.Event('mousedown', { which: 1 }));
            require('./scripts/common').is_active.returns(true);
            obj.trigger($.Event('click', { which: 2 }));
            require('./scripts/common').is_active.returns(false);
            sandbox.clock.tick(333);
        });

        it('should not trigger longpress after mouseleave > 333ms', function() {
            sandbox.stub(require('./scripts/common'), 'is_active');
            obj.on('longpress', function() {
                expect(true).to.be.false;
            });
            obj.trigger($.Event('mousedown', { which: 1 }));
            require('./scripts/common').is_active.returns(true);
            obj.mouseleave();
            require('./scripts/common').is_active.returns(false);
            sandbox.clock.tick(333);
        });

        it('should not trigger longpress after mousemove > 333ms', function() {
            sandbox.stub(require('./scripts/common'), 'is_active');
            obj.on('longpress', function() {
                expect(true).to.be.false;
            });
            obj.trigger($.Event('mousedown', { which: 1 }));
            require('./scripts/common').is_active.returns(true);
            obj.mousemove();
            require('./scripts/common').is_active.returns(false);
            sandbox.clock.tick(333);
        });
    });

    describe('on longpress', function() {
        it('should send activate', function() {
            obj.trigger('longpress', ['URL']);
            sandbox.stub(require('./scripts/common'), 'is_active').returns(true);

            expect(sendMessage).to.have.been.calledWith({ msg: 'activate', url: 'URL' });
        });

        it('should have pointer-events:none && cursor:default', function() {
            obj.trigger('longpress', ['URL']);
            sandbox.stub(require('./scripts/common'), 'is_active').returns(true);

            expect(obj).to.have.css('pointer-events', 'none');
            expect(obj).to.have.css('cursor', 'default');
        });

        it('should have pointer-events/cursor:initial after inactive for 100ms', function() {
            sandbox.stub(require('./scripts/common'), 'is_active');
            obj.css('pointer-events', 'painted');
            obj.css('cursor', 'none');
            obj.trigger('longpress', ['URL']);
            require('./scripts/common').is_active.returns(true);
            sandbox.clock.tick(100);
            require('./scripts/common').is_active.returns(false);
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
});
