'use strict';

describe('state-manager', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function(done) {
        require(['state-manager'], function(stateManager) {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            stateManager();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should send empty object on getstate', function() {
        var callback = sandbox.spy();
        chrome.runtime.onMessage.addListener.yield({ msg: 'getstate' }, {}, callback);
        expect(callback).to.have.been.calledWith({});
    });

    it('should return state on setstate > getstate', function() {
        var callback = sandbox.spy();
        chrome.runtime.onMessage.addListener.yield({ msg: 'setstate', state: { key: 'value' } }, {}, $.noop);
        chrome.runtime.onMessage.addListener.yield({ msg: 'getstate' }, {}, callback);
        expect(callback).to.have.been.calledWith({ key: 'value' });
    });
});
