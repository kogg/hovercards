'use strict';

describe('background', function() {
    var sandbox = sinon.sandbox.create();
    var background;

    beforeEach(function(done) {
        require(['background'], function(_background) {
            background = _background;
            done();
        });
    });

    describe('when receiving info', function() {
        it('should tell sidebar to be visible', function() {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            background();
            chrome.runtime.onMessage.addListener.yield({ msg: 'info', key: 'somewhere', value: 'SOMEWHERE_ID' }, { tab: { id: 'TAB_ID' } }, $.noop);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', key: 'display', value: 'visible' });
        });
    });

    describe('when receiving interest', function() {
        it('= sure, should tell sidebar to stay visible', function() {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            background();
            chrome.runtime.onMessage.addListener.yield({ msg: 'interest', key: 'confidence', value: 'sure' }, { tab: { id: 'TAB_ID' } }, $.noop);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', key: 'display', value: 'stay_visible' });
        });

        it('= unsure, should tell sidebar to be whatever it wants', function() {
            sandbox.stub(chrome.tabs, 'sendMessage');
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            background();
            chrome.runtime.onMessage.addListener.yield({ msg: 'interest', key: 'confidence', value: 'unsure' }, { tab: { id: 'TAB_ID' } }, $.noop);
            chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', key: 'display', value: 'unconcerned' });
        });
    });

    afterEach(function() {
        $('#sandbox').empty();
        $('#sandbox').off();
        sandbox.restore();
    });
});
