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

    it('should assign data elements', function() {
        sandbox.stub(chrome.runtime, 'sendMessage');
        var obj = trigger('#trigger', 'somewhere', 'SOME_ID').appendTo('#sandbox');
        obj.should.have.data('deckard_network', 'somewhere');
        obj.should.have.data('deckard_id', 'SOME_ID');
    });

    it('should request load on mouseenter', function() {
        sandbox.stub(chrome.runtime, 'sendMessage');
        var obj = trigger('#trigger', 'somewhere', 'SOME_ID').appendTo('#sandbox');
        chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'load', network: 'somewhere', id: 'SOME_ID' });
        obj.mouseenter();
        chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'load', network: 'somewhere', id: 'SOME_ID' });
    });

    it('should lose confidence in their interest on mouseleave', function() {
        sandbox.stub(chrome.runtime, 'sendMessage');
        var obj = trigger('#trigger', 'somewhere', 'SOME_ID').appendTo('#sandbox');
        obj.mouseenter();
        chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'interest', interested: null });
        obj.mouseleave();
        chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'interest', interested: null });
    });

    it('should be confident in their interest on click', function() {
        sandbox.stub(chrome.runtime, 'sendMessage');
        var obj = trigger('#trigger', 'somewhere', 'SOME_ID').appendTo('#sandbox');
        chrome.runtime.sendMessage.should.not.have.been.calledWith({ msg: 'interest', interested: true });
        obj.click();
        chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'interest', interested: true });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
