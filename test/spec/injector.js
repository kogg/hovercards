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
        it('should add to registered', function() {
            var spy = sandbox.spy();
            injector.register('context', 'body', spy);
            injector.registered.context.body[0].should.equal(spy);
        });
    });
});
