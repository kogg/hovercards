'use strict';

describe('embedded-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var embedded_trigger;

    beforeEach(function(done) {
        require(['embedded-trigger'], function(_embedded_trigger) {
            embedded_trigger = _embedded_trigger;
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
        embedded_trigger.obj = null;
    });

    describe('.on', function() {
        var obj;

        beforeEach(function() {
            body = $('<div id="body"></div>');
            obj = $('<embed id="obj" src="URL">').appendTo(body);
            embedded_trigger.on(body, '#obj', function(_obj) {
                return obj.is(_obj) ? obj.attr('src') : null;
            });
        });

        it('should create an element', function() {
            expect(body.find('.hovercards-embedded-trigger')).to.exist;
        });

        it('should not create multiple elements', function() {
            embedded_trigger.on(body, '#somethingelse', function() {
                return null;
            });
            expect(body.find('.hovercards-embedded-trigger').length).to.equal(1);
        });
    });
});
