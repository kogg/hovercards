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

    it('should be called on more cards', function() {
        $('<div id="first-card" style="display: none;" data-more=\'["third"]\'></div>').appendTo('#sandbox');
        $('<div id="second-card" style="display: none;"></div>').appendTo('#sandbox');
        var third = $('<div id="third-card" style="display: none;"></div>').appendTo('#sandbox');

        var card = cards('#sandbox');
        card('first');

        third.should.be.visible;
    });

    it('should be called on five cards max', function() {
        var first = $('<div id="first-card" style="display: none;"></div>').appendTo('#sandbox');
        var second = $('<div id="second-card" style="display: none;"></div>').appendTo('#sandbox');
        var third = $('<div id="third-card" style="display: none;"></div>').appendTo('#sandbox');
        var fourth = $('<div id="fourth-card" style="display: none;"></div>').appendTo('#sandbox');
        var fifth = $('<div id="fifth-card" style="display: none;"></div>').appendTo('#sandbox');
        var sixth = $('<div id="sixth-card" style="display: none;"></div>').appendTo('#sandbox');

        var card = cards('#sandbox');
        card('first');
        card('second');
        card('third');
        card('fourth');
        card('fifth');
        card('sixth');

        first.should.be.visible;
        second.should.be.visible;
        third.should.be.visible;
        fourth.should.be.visible;
        fifth.should.be.visible;
        sixth.should.not.be.visible;
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
