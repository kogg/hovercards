'use strict';

describe('notifications-inject', function() {
    var sandbox = sinon.sandbox.create();
    var body;

    beforeEach(function(done) {
        require(['notifications-inject'], function(notificationsInject) {
            body = $('<div id="sandbox"></div>');
            notificationsInject.on(body);
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    it('should not make a notification initially', function() {
        expect(body.find('.hovercards-notification')).to.not.exist;
    });
});
