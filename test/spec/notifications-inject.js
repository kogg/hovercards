'use strict';

describe('notifications-inject', function() {
    var sandbox = sinon.sandbox.create();
    var body;

    beforeEach(function(done) {
        require(['notifications-inject'], function(notificationsInject) {
            sandbox.useFakeTimers();
            sandbox.stub(chrome.i18n, 'getMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            chrome.i18n.getMessage.withArgs('sometype_notification').returns('Some Notification Text');
            body = $('<div id="body"></div>');
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

    describe('on notify', function() {
        it('should create a card', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'sometype' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            expect(element).to.exist;
        });

        it('should set the text to getMessage', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'sometype' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            expect(element.find('.hovercards-notification-text')).to.have.html('<p>Some Notification Text</p>');
        });

        it('should leave on load', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'sometype' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should leave on hide', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'sometype' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should leave on click', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'sometype' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            element.trigger($.Event('click', { which: 1 }));
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should leave after 15s', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'sometype' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            sandbox.clock.tick(15000);
            expect(element).to.match('.hovercards-notification-exit-animation');
        });
    });
});
