'use strict';

define(['sidebar', 'sinon'], function(sidebar, sinon) {
    describe('sidebar-put-in-element', function() {
        var sandbox = sinon.sandbox.create();

        describe('view', function() {
            it('should have class deckard-youtube-button', function() {
                sidebar().appendTo('#sandbox').should.have.class('deckard-sidebar');
            });

            it('should be hidden', function() {
                sidebar().appendTo('#sandbox').should.be.hidden;
            });

            it('should contain an iframe with sidebar.html', function() {
                sandbox.stub(chrome.extension, 'getURL').returns('chrome://gibberish_id/sidebar.html');
                var sidebarObj = sidebar().appendTo('#sandbox');
                sidebarObj.should.have.descendants('iframe');
                chrome.extension.getURL.should.have.been.calledWith('sidebar.html');
                sidebarObj.children('iframe').should.have.prop('src', 'chrome://gibberish_id/sidebar.html');
            });
        });

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
});
