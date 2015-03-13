'use strict';

describe('card-handler', function() {
    var sandbox = sinon.sandbox.create();
    var cardHandler;

    beforeEach(function(done) {
        require(['card-handler'], function(_cardHandler) {
            cardHandler = _cardHandler;
            done();
        });
    });

    describe('handled cards', function() {
        it('should be visible', function() {
            var cardObj = $('<div id="something-card" style="display: none;"></div>').appendTo('#sandbox');

            var handleCard = cardHandler('#sandbox');
            handleCard('something');

            cardObj.should.be.visible;
        });

        it('should be reordered', function() {
            $('<div id="third-card"></div>').appendTo('#sandbox');
            $('<div id="second-card"></div>').appendTo('#sandbox');
            $('<div id="first-card"></div>').appendTo('#sandbox');

            var handleCard = cardHandler('#sandbox');
            handleCard('first');
            handleCard('second');
            handleCard('third');

            $('#sandbox :eq(0)').should.have.id('first-card');
            $('#sandbox :eq(1)').should.have.id('second-card');
            $('#sandbox :eq(2)').should.have.id('third-card');
        });

        it('should handle more cards', function() {
            $('<div id="first-card" style="display: none;" data-more=\'["third"]\'></div>').appendTo('#sandbox');
            $('<div id="second-card" style="display: none;"></div>').appendTo('#sandbox');
            var third = $('<div id="third-card" style="display: none;"></div>').appendTo('#sandbox');

            var handleCard = cardHandler('#sandbox');
            handleCard('first');

            third.should.be.visible;
        });

        it('should be capped at five cards', function() {
            var first = $('<div id="first-card" style="display: none;"></div>').appendTo('#sandbox');
            var second = $('<div id="second-card" style="display: none;"></div>').appendTo('#sandbox');
            var third = $('<div id="third-card" style="display: none;"></div>').appendTo('#sandbox');
            var fourth = $('<div id="fourth-card" style="display: none;"></div>').appendTo('#sandbox');
            var fifth = $('<div id="fifth-card" style="display: none;"></div>').appendTo('#sandbox');
            var sixth = $('<div id="sixth-card" style="display: none;"></div>').appendTo('#sandbox');

            var handleCard = cardHandler('#sandbox');
            handleCard('first');
            handleCard('second');
            handleCard('third');
            handleCard('fourth');
            handleCard('fifth');
            handleCard('sixth');

            first.should.be.visible;
            second.should.be.visible;
            third.should.be.visible;
            fourth.should.be.visible;
            fifth.should.be.visible;
            sixth.should.not.be.visible;
        });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
