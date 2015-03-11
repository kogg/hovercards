'use strict';

describe('injector', function() {
    var sandbox = sinon.sandbox.create();

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
