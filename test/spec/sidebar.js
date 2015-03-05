'use strict';

define(['sidebar', 'sinon'], function(sidebar, sinon) {
    describe('sidebar', function() {
        var sandbox = sinon.sandbox.create();

        describe('view', function() {
            it('should have class deckard-sidebar', function() {
                sidebar().appendTo('#sandbox').should.have.class('deckard-sidebar');
            });

            it('should be hidden', function() {
                sidebar().appendTo('#sandbox').should.be.hidden;
            });

            it('should contain an iframe with sidebar.html', function() {
                var sidebarObj = sidebar().appendTo('#sandbox');
                sidebarObj.should.have.descendants('iframe');
                sidebarObj.children('iframe').should.have.prop('src', 'chrome://extension_id/sidebar.html');
            });
        });

        describe('info', function() {
            it('should be visible on receiving the message', function() {
                sandbox.stub(chrome.runtime.onMessage, 'addListener');
                var sidebarObj = sidebar().appendTo('#sandbox');
                chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', key: 'display', value: 'visible' },
                                                           {},
                                                           $.noop);
                sidebarObj.should.be.visible;
            });

            it('should be hidden when uninterested', function() {
                sandbox.stub(chrome.runtime.onMessage, 'addListener');
                var sidebarObj = sidebar().appendTo('#sandbox');
                chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', key: 'display', value: 'visible' },
                                                           {},
                                                           $.noop);
                chrome.runtime.onMessage.addListener.yield({ msg: 'sidebar', key: 'display', value: 'uninterested' },
                                                           {},
                                                           $.noop);
                sidebarObj.should.be.hidden;
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
});
