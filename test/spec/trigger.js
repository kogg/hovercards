'use strict';

describe('trigger', function() {
    var sandbox = sinon.sandbox.create();
    var triggerObj;

    beforeEach(function(done) {
        $('<div id="sandbox"></div>').appendTo('body');
        $('<div id="trigger"></div>').appendTo('#sandbox');
        require(['trigger'], function(trigger) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            triggerObj = trigger('#trigger', 'something', 'SOME_ID').appendTo('#sandbox');
            done();
        });
    });

    afterEach(function() {
        $('#sandbox').remove();
        sandbox.restore();
    });

    it('should have data hovertoast_content', function() {
        triggerObj.should.have.data('hovertoast_content', 'something');
    });

    it('should have data hovertoast_id', function() {
        triggerObj.should.have.data('hovertoast_id', 'SOME_ID');
    });

    describe('when mouseenter', function() {
        beforeEach(function() {
            triggerObj.mouseenter();
        });

        it('should send triggered message', function() {
            chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'triggered', content: 'something', id: 'SOME_ID' });
        });
    });

    describe('when mouseleave', function() {
        beforeEach(function() {
            triggerObj.mouseenter().mouseleave();
        });

        it('should send untriggered message', function() {
            chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'untriggered' });
        });
    });
});
