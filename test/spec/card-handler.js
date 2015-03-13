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

    describe('#handleCard', function() {
        it('should make handled cards visible', function() {
            var cardObj = $('<div id="something-card" style="display: none;"></div>').appendTo('#sandbox');

            var handler = cardHandler('#sandbox');
            handler.handleCard('something');

            cardObj.should.be.visible;
        });

        it('should be reorder cards', function() {
            $('<div id="third-card"></div>').appendTo('#sandbox');
            $('<div id="second-card"></div>').appendTo('#sandbox');
            $('<div id="first-card"></div>').appendTo('#sandbox');

            var handler = cardHandler('#sandbox');
            handler.handleCard('first');
            handler.handleCard('second');
            handler.handleCard('third');

            $('#sandbox :eq(0)').should.have.id('first-card');
            $('#sandbox :eq(1)').should.have.id('second-card');
            $('#sandbox :eq(2)').should.have.id('third-card');
        });

        it('should handle more cards', function() {
            $('<div id="first-card" style="display: none;" data-more=\'["third"]\'></div>').appendTo('#sandbox');
            $('<div id="second-card" style="display: none;"></div>').appendTo('#sandbox');
            $('<div id="third-card" style="display: none;"></div>').appendTo('#sandbox');

            var handler = cardHandler('#sandbox');
            handler.handleCard('first');

            handler.handled.should.contain('first');
            handler.handled.should.not.contain('second');
            handler.handled.should.contain('third');
        });

        it('should be capped at five cards', function() {
            $('<div id="first-card" style="display: none;"></div>').appendTo('#sandbox');
            $('<div id="second-card" style="display: none;"></div>').appendTo('#sandbox');
            $('<div id="third-card" style="display: none;"></div>').appendTo('#sandbox');
            $('<div id="fourth-card" style="display: none;"></div>').appendTo('#sandbox');
            $('<div id="fifth-card" style="display: none;"></div>').appendTo('#sandbox');
            $('<div id="sixth-card" style="display: none;"></div>').appendTo('#sandbox');

            var handler = cardHandler('#sandbox');
            handler.handleCard('first');
            handler.handleCard('second');
            handler.handleCard('third');
            handler.handleCard('fourth');
            handler.handleCard('fifth');
            handler.handleCard('sixth');

            handler.handled.should.contain('first');
            handler.handled.should.contain('second');
            handler.handled.should.contain('third');
            handler.handled.should.contain('fourth');
            handler.handled.should.contain('fifth');
            handler.handled.should.not.contain('sixth');
        });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
