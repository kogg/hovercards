'use strict';

define(['background', 'jquery', 'sinon'], function(background, $, sinon) {
    describe('background', function() {
        var sandbox = sinon.sandbox.create();

        describe('request-info', function() {
            it('should redistribute the message to the tab it came from', function() {
                sinon.stub(chrome.tabs, 'sendMessage');
                sinon.stub(chrome.runtime.onMessage, 'addListener');
                background();
                chrome.runtime.onMessage.addListener.yield({ msg: 'request-info', key: 'somewhere' },
                                                           { tab: { id: 'TAB_ID' } },
                                                           $.noop);
                chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'request-info', key: 'somewhere' });
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
});
