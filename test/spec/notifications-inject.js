'use strict';

describe('notifications-inject', function() {
    var sandbox = sinon.sandbox.create();
    var body;

    beforeEach(function(done) {
        require(['notifications-inject'], function(notificationsInject) {
            sandbox.useFakeTimers();
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

    it('should make a notification container', function() {
        expect(body.children('.hovercards-notifications-container')).to.exist;
    });

    describe('on notification', function() {
        var element;

        beforeEach(function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
        });

        it('should create a card', function() {
            expect(element).to.exist;
        });

        it('should set the image', function() {
            expect(element.find('.hovercards-notification-image')).to.have.css('background-image', 'url(chrome-extension://extension_id/images/somewhere-notification.gif)');
        });

        it('should leave on load', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', provider: 'somewhere', content: 'something', id: 'SOME_ID' });
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should leave on hide', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should leave on click', function() {
            element.trigger($.Event('click', { which: 1 }));
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should leave after 15s', function() {
            sandbox.clock.tick(15000);
            expect(element).to.match('.hovercards-notification-exit-animation');
        });
    });
});
