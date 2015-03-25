'use strict';

describe('injector', function() {
    var sandbox = sinon.sandbox.create();
    var injector;

    beforeEach(function(done) {
        require(['injector'], function(_injector) {
            injector = _injector;
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
        injector.registered = {};
    });

    describe('#register', function() {
        it('should add injection to registered', function() {
            var spy = sandbox.spy();
            injector.register('context', spy);
            injector.registered.context[0].should.equal(spy);
        });

        it('should add injection to registered without context', function() {
            var spy = sandbox.spy();
            injector.register(spy);
            injector.registered.default[0].should.equal(spy);
        });

        it('should allow multiple injections of the same context to be registered', function() {
            var spy  = sandbox.spy();
            var spy2 = sandbox.spy();
            injector.register('context', spy);
            injector.register('context', spy2);
            injector.registered.context[0].should.equal(spy);
            injector.registered.context[1].should.equal(spy2);
        });

        it('should allow multiple injections of the different contexts to be registered', function() {
            var spy  = sandbox.spy();
            var spy2 = sandbox.spy();
            injector.register('context', spy);
            injector.register('context2', spy2);
            injector.registered.context[0].should.equal(spy);
            injector.registered.context2[0].should.equal(spy2);
        });
    });

    describe('#register', function() {
        it('should call injections in the same context', function() {
            var spy = sandbox.spy();
            var spy2 = sandbox.spy();
            injector.registered = { context: [spy, spy2] };
            injector.inject('context', 'body');
            spy.should.have.been.called.once;
            spy2.should.have.been.called.once;
        });

        it('should not call injections in a different context', function() {
            var spy = sandbox.spy();
            var spy2 = sandbox.spy();
            injector.registered = { context: [spy, spy2] };
            injector.inject('differentcontext', 'body');
            spy.should.not.have.been.called;
            spy2.should.not.have.been.called;
        });

        it('should call injections with jquery wrapped body', function() {
            var spy = sandbox.spy();
            injector.registered = { context: [spy] };
            injector.inject('context', 'body');
            spy.should.have.been.calledWith(sinon.match(function(body) {
                return body.should.match('body');
            }, 'selector of body'));
        });

        it('should call injections in the default context when not defined', function() {
            var spy = sandbox.spy();
            injector.registered = { default: [spy] };
            injector.inject('body');
            spy.should.have.been.called.once;
            spy.should.have.been.calledWith(sinon.match(function(body) {
                return body.should.match('body');
            }, 'selector of body'));
        });

        it('should call injections in the default context on "body" when not defined', function() {
            var spy = sandbox.spy();
            injector.registered = { default: [spy] };
            injector.inject();
            spy.should.have.been.called.once;
            spy.should.have.been.calledWith(sinon.match(function(body) {
                return body.should.match('body');
            }, 'selector of body'));
        });
    });
});
