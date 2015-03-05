'use strict';

define(['background', 'jquery', 'sinon'], function(background, $, sinon) {
    describe('background', function() {
        var sandbox = sinon.sandbox.create();

        describe('info', function() {
            it('should tell sidebar to show itself', function() {
                sandbox.stub(chrome.tabs, 'sendMessage');
                sandbox.stub(chrome.runtime.onMessage, 'addListener');
                background();
                chrome.runtime.onMessage.addListener.yield({ msg: 'info', key: 'somewhere' },
                                                           { tab: { id: 'TAB_ID' } },
                                                           $.noop);
                chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', key: 'display', value: 'visible' });
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
});
