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

    it('should be visible when called', function() {
        var cardObj = $('<div id="something-card" style="display: none;"></div>').appendTo('#sandbox');
        cardObj.should.not.be.visible;

        var card = cards('#sandbox');
        card('something');

        cardObj.should.be.visible;
    });

    it('should reorder the cards in the order they\'re called', function() {
        $('<div id="third-card"></div>').appendTo('#sandbox');
        $('<div id="second-card"></div>').appendTo('#sandbox');
        $('<div id="first-card"></div>').appendTo('#sandbox');

        var card = cards('#sandbox');
        card('first');
        card('second');
        card('third');

        $('#sandbox :eq(0)').should.have.id('first-card');
        $('#sandbox :eq(1)').should.have.id('second-card');
        $('#sandbox :eq(2)').should.have.id('third-card');
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
