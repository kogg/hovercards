'use strict';

describe('cards', function() {
    var sandbox = sinon.sandbox.create();
    var cards;

    beforeEach(function(done) {
        require(['cards'], function(_cards) {
            cards = _cards;
            done();
        });
    });

    it('should have a test', function() {
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
