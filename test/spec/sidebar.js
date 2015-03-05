'use strict';

define(['sidebar', 'sinon'], function(sidebar, sinon) {
    describe('sidebar', function() {
        var sandbox = sinon.sandbox.create();

        describe('view', function() {
            it('should have class deckard-youtube-button', function() {
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

        afterEach(function() {
            $('#sandbox').empty();
            $('#sandbox').off();
            sandbox.restore();
        });
    });
});
