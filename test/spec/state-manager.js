'use strict';

describe('state-manager', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['state-manager'], function(stateManager) {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            stateManager.init();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should send null on get', function() {
        var callback = sandbox.spy();
        chrome.runtime.onMessage.addListener.yield({ msg: 'get', value: 'something' }, {}, callback);
        expect(callback).to.have.been.calledWith(undefined);
    });

    it('should return value on set > get', function() {
        var callback = sandbox.spy();
        chrome.runtime.onMessage.addListener.yield({ msg: 'set', value: { something: 'somevalue' } }, {}, $.noop);
        chrome.runtime.onMessage.addListener.yield({ msg: 'get', value: 'something' }, {}, callback);
        expect(callback).to.have.been.calledWith('somevalue');
    });
});
