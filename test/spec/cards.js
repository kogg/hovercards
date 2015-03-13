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

    it('should reorder the cards in the order they\'re called', function() {
        $('#sandbox').append('<div id="first-card"></div>');
        $('#sandbox').append('<div id="second-card"></div>');
        $('#sandbox').append('<div id="third-card"></div>');
        var card = cards('#sandbox');
        card('third');
        card('second');
        card('first');
        $('#sandbox :eq(0)').should.have.id('third-card');
        $('#sandbox :eq(1)').should.have.id('second-card');
        $('#sandbox :eq(2)').should.have.id('first-card');
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
