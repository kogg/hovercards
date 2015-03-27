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
        it('should send deck on mouseenter', function() {
            triggerObj.mouseenter();
            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'deck', content: 'something', id: 'SOME_ID' });
        });

        it('should send undodeck on mouseenter > mouseleave', function() {
            triggerObj.mouseenter().mouseleave();
            expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'undodeck' });
        });

        it('should not send undodeck on mouseenter > 500ms > mouseleave', function() {
            triggerObj.mouseenter();
            sandbox.clock.tick(500);
            triggerObj.mouseleave();
            expect(chrome.runtime.sendMessage).to.not.have.been.calledWith({ msg: 'undodeck' });
        });
    });
});
