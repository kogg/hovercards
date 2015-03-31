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

    describe('a notification', function() {
        it('should create a card on notification', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'sometype', instance: 'someinstance' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            expect(element).to.exist;
        });

        it('should set a background image for the notification', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'sometype', instance: 'someinstance' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            expect(element.find('.hovercards-notification-image')).to.have.css('background-image', 'url(chrome-extension://extension_id/images/sometype-notification.gif)');
        });

        it('should add .hovercards-notification-exit-animation on load', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', provider: 'somewhere', content: 'something', id: 'SOME_ID' });
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should add .hovercards-notification-exit-animation on hide', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should add .hovercards-notification-exit-animation on click', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            element.trigger($.Event('click', { which: 1 }));
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should add .hovercards-notification-exit-animation after 15s', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            sandbox.clock.tick(15000);
            expect(element).to.match('.hovercards-notification-exit-animation');
        });
    });
});
