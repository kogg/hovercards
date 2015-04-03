'use strict';

describe('notifications-inject', function() {
    var sandbox = sinon.sandbox.create();
    var body;

    beforeEach(function(done) {
        require(['notifications-inject'], function(notificationsInject) {
            sandbox.useFakeTimers();
            sandbox.stub(chrome.i18n, 'getMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            chrome.i18n.getMessage.withArgs('somewhere_something').returns('Somewhere_Something');
            chrome.i18n.getMessage.withArgs('hovercards_something_notification').returns('Some HoverCards Stuff');
            chrome.i18n.getMessage.withArgs('trigger_notification', ['Somewhere_Something']).returns('Some Network Stuff');
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
        it('should create a card', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            expect(element).to.exist;
        });

        it('should set the image', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            expect(element.find('.hovercards-notification-image')).to.have.css('background-image', 'url(chrome-extension://extension_id/images/somewhere-notification.gif)');
        });

        it('should set the text to getMessage if not hovercards', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            expect(element.find('.hovercards-notification-text')).to.have.html('<p>Some Network Stuff</p>');
        });

        it('should set the text to getMessage if hovercards', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'hovercards', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            expect(element.find('.hovercards-notification-text')).to.have.html('<p>Some HoverCards Stuff</p>');
        });

        it('should leave on load', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', provider: 'somewhere', content: 'something', id: 'SOME_ID' });
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should leave on hide', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should leave on click', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            element.trigger($.Event('click', { which: 1 }));
            expect(element).to.match('.hovercards-notification-exit-animation');
        });

        it('should leave after 15s', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'notify', type: 'somewhere', instance: 'something' });
            var element = body.children('.hovercards-notifications-container').children('.hovercards-notification');
            sandbox.clock.tick(15000);
            expect(element).to.match('.hovercards-notification-exit-animation');
        });
    });
});
