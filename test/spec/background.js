'use strict';

define(['background', 'jquery', 'sinon'], function(background, $, sinon) {
    describe('background', function() {
        var sandbox = sinon.sandbox.create();

        describe('info', function() {
            it('should tell sidebar to show', function() {
                sandbox.stub(chrome.tabs, 'sendMessage');
                sandbox.stub(chrome.runtime.onMessage, 'addListener');
                background();
                chrome.runtime.onMessage.addListener.yield({ msg: 'info', key: 'somewhere' },
                                                           { tab: { id: 'TAB_ID' } },
                                                           $.noop);
                chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', key: 'display', value: 'visible' });
            });
        });


        describe('interest', function() {
            it('should tell sidebar to stay visible when we\'re sure of interest', function() {
                sandbox.stub(chrome.tabs, 'sendMessage');
                sandbox.stub(chrome.runtime.onMessage, 'addListener');
                background();
                chrome.runtime.onMessage.addListener.yield({ msg: 'interest', key: 'confidence', value: 'sure' },
                                                           { tab: { id: 'TAB_ID' } },
                                                           $.noop);
                chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', key: 'display', value: 'stay_visible' });
            });

            it('should tell sidebar it can do whatever when we\'re unsure of interest', function() {
                sandbox.stub(chrome.tabs, 'sendMessage');
                sandbox.stub(chrome.runtime.onMessage, 'addListener');
                background();
                chrome.runtime.onMessage.addListener.yield({ msg: 'interest', key: 'confidence', value: 'unsure' },
                                                           { tab: { id: 'TAB_ID' } },
                                                           $.noop);
                chrome.tabs.sendMessage.should.have.been.calledWith('TAB_ID', { msg: 'sidebar', key: 'display', value: 'unconcerned' });
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
});
