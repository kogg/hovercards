'use strict';

describe('trigger', function() {
    var sandbox = sinon.sandbox.create();
    var triggerObj;

    beforeEach(function(done) {
        require(['trigger'], function(trigger) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            triggerObj = trigger($('<div></div>'), 'something', 'SOME_ID');
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on mouseenter', function() {
        beforeEach(function() {
            triggerObj.mouseenter();
        });

        it('should send triggered message', function() {
            chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'trigger', content: 'something', id: 'SOME_ID' });
        });
    });

    describe('on mouseleave', function() {
        beforeEach(function() {
            triggerObj.mouseenter().mouseleave();
        });

        it('should send untriggered message', function() {
            chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'untrigger' });
        });
    });
});
