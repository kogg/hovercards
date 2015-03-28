'use strict';

describe('hotkey-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var hotkeyTrigger;

    beforeEach(function(done) {
        require(['hotkey-trigger'], function(_hotkeyTrigger) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            hotkeyTrigger = _hotkeyTrigger;
            done();
        });
    });

    beforeEach(function() {
        body = $('<div id="sandbox"></div>');
        hotkeyTrigger.handle(body);
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    describe('hotkey', function() {
        it('should send msg:activate on shift', function() {
            var e = jQuery.Event('keydown');
            e.which = 16;
            body.trigger(e);
            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'activate' });
        });

        it('should not send msg:activate on something else', function() {
            var e = jQuery.Event('keydown');
            e.which = 17;
            body.trigger(e);
            expect(chrome.runtime.sendMessage).not.to.have.been.calledWith({ msg: 'activate' });
        });
    });
});
