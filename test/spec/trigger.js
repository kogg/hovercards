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

    describe('on mouseenter', function() {
        it('should send triggered message after 500ms', function() {
            triggerObj.mouseenter();
            sandbox.clock.tick(499);
            chrome.runtime.sendMessage.should.not.have.been.called;
            sandbox.clock.tick(500);
            chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'deck', content: 'something', id: 'SOME_ID' });
        });
    });

    describe('on mouseleave', function() {
        it('should not send triggered message after 500ms', function() {
            triggerObj.mouseenter().mouseleave();
            sandbox.clock.tick(499);
            chrome.runtime.sendMessage.should.not.have.been.called;
            sandbox.clock.tick(500);
            chrome.runtime.sendMessage.should.not.have.been.called;
        });
    });
});
