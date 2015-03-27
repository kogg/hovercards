'use strict';

describe('trigger', function() {
    var sandbox = sinon.sandbox.create();
    var triggerObj;

    beforeEach(function(done) {
        require(['trigger'], function(trigger) {
            sandbox.useFakeTimers();
            sandbox.stub(chrome.runtime, 'sendMessage');
            triggerObj = trigger($('<div></div>'), 'something', 'SOME_ID');
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on mouseevents', function() {
        it('should send deck on mouseenter > 500ms', function() {
            triggerObj.mouseenter();
            sandbox.clock.tick(499);
            expect(chrome.runtime.sendMessage).to.not.have.been.called;
            sandbox.clock.tick(500);
            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'deck', content: 'something', id: 'SOME_ID' });
        });

        it('should not send deck on mouseenter > mouseleave > 500ms', function() {
            triggerObj.mouseenter().mouseleave();
            sandbox.clock.tick(499);
            expect(chrome.runtime.sendMessage).to.not.have.been.called;
            sandbox.clock.tick(500);
            expect(chrome.runtime.sendMessage).to.not.have.been.called;
        });
    });
});
