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
});
