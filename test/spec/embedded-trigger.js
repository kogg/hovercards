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
    });

    describe('.on', function() {
        var obj;

        beforeEach(function() {
            body = $('<div id="body"></div>');
            obj = $('<embed id="obj">').appendTo(body);
            embedded_trigger.on(body, '#obj', function(_obj) {
                return (obj[0] === _obj[0]) ? 'yup' : 'nope';
            });
        });

        it('should have a test', function() {
        });
    });
});
