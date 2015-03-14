'use strict';

describe('trigger', function() {
    var sandbox = sinon.sandbox.create();
    var triggerObj;

    beforeEach(function(done) {
        $('#sandbox').append('<div id="trigger"></div>');
        require(['trigger'], function(trigger) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            triggerObj = trigger('#trigger', 'something', 'SOME_ID').appendTo('#sandbox');
            done();
        });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });

    it('should have data hovertoast_content', function() {
        triggerObj.should.have.data('hovertoast_content', 'something');
    });

    it('should have data hovertoast_id', function() {
        triggerObj.should.have.data('hovertoast_id', 'SOME_ID');
    });

    describe('when mouseenter', function() {
        it('should send pre-load message', function() {
            triggerObj.mouseenter();
            chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'pre-load', content: 'something', id: 'SOME_ID' });
        });
    });

    describe('when mouseleave', function() {
        it('should send uninterested message', function() {
            triggerObj.mouseenter();
            chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'interest', interested: null });
            triggerObj.mouseleave();
            chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'interest', interested: null });
        });
    });

    describe('when click', function() {
        it('should send interested message', function() {
            triggerObj.click();
            chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'interest', interested: true });
        });
    });
});
