'use strict';

describe('trigger', function() {
    var sandbox = sinon.sandbox.create();
    var trigger;

    beforeEach(function(done) {
        $('#sandbox').append('<div id="trigger"></div>');
        require(['trigger'], function(_trigger) {
            trigger = _trigger;
            done();
        });
    });

    it('should have data hovertoast_network', function() {
        sandbox.stub(chrome.runtime, 'sendMessage');
        var obj = trigger('#trigger', 'somewhere', 'SOME_ID').appendTo('#sandbox');
        obj.should.have.data('hovertoast_network', 'somewhere');
    });

    it('should have data hovertoast_id', function() {
        sandbox.stub(chrome.runtime, 'sendMessage');
        var obj = trigger('#trigger', 'somewhere', 'SOME_ID').appendTo('#sandbox');
        obj.should.have.data('hovertoast_id', 'SOME_ID');
    });

    describe('when mouseenter', function() {
        it('should request pre-load', function() {
            sandbox.stub(chrome.runtime, 'sendMessage');
            var obj = trigger('#trigger', 'somewhere', 'SOME_ID').appendTo('#sandbox');
            chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'pre-load', network: 'somewhere', id: 'SOME_ID' });
            obj.mouseenter();
            chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'pre-load', network: 'somewhere', id: 'SOME_ID' });
        });
    });

    describe('when mouseleave', function() {
        it('should lose confidence in their interest', function() {
            sandbox.stub(chrome.runtime, 'sendMessage');
            var obj = trigger('#trigger', 'somewhere', 'SOME_ID').appendTo('#sandbox');
            obj.mouseenter();
            chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'interest', interested: null });
            obj.mouseleave();
            chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'interest', interested: null });
        });
    });

    describe('when click', function() {
        it('should be confident in their interest', function() {
            sandbox.stub(chrome.runtime, 'sendMessage');
            var obj = trigger('#trigger', 'somewhere', 'SOME_ID').appendTo('#sandbox');
            chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'interest', interested: true });
            obj.click();
            chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'interest', interested: true });
        });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
