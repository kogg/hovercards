'use strict';

describe('notifications-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['notifications-background'], function(notificationsBackground) {
            notificationsBackground.init();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should have a test', function() {
    });
});
