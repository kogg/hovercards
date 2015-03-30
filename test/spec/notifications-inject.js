'use strict';

describe('notifications-inject', function() {
    var sandbox = sinon.sandbox.create();
    var body;

    beforeEach(function(done) {
        require(['notifications-inject'], function(notificationsInject) {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
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

    it('should create a card on notification', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'notification', which: 'something' });
        expect(body.find('.hovercards-notification')).to.exist;
    });

    it('should add .hovercards-notification-exit-animation on click', function() {
        chrome.runtime.onMessage.addListener.yield({ msg: 'notification', which: 'something' });
        var element = body.find('.hovercards-notification');
        element.trigger($.Event('click', { which: 1 }));
        expect(element).to.match('.hovercards-notification-exit-animation');
    });
});
