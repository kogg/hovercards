'use strict';

describe('injector', function() {
    var injector;

    beforeEach(function(done) {
        require(['injector'], function(_injector) {
            injector = _injector;
            done();
        });
    });

    describe('#register', function() {
        it('should be a function', function() {
            injector.register.should.be.a('function');
        });
    });

    describe('#inject', function() {
        it('should be a function', function() {
            injector.inject.should.be.a('function');
        });
    });
});
