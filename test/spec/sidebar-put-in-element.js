'use strict';

describe('sidebar-put-in-element', function() {
    var sandbox, sidebar;

    before(function(done) {
        require(['sidebar', 'sinon'], function(_sidebar, sinon) {
            sidebar = _sidebar;
            sandbox = sinon.sandbox.create();
            done();
        });
    });

    describe('appearance', function() {
        it('should have class deckard-youtube-button', function() {
            sidebar.putInElement('#sandbox').should.have.class('deckard-sidebar');
        });

        it('should be in the element', function() {
            sidebar.putInElement('#sandbox');

            $('#sandbox > .deckard-sidebar').should.exist;
        });

        it('should be hidden', function() {
            sidebar.putInElement('#sandbox').should.be.hidden;
        });
    });

    describe('behavior', function() {
        it('should contain an iframe with sidebar.html', function() {
            sandbox.stub(chrome.extension, 'getURL').returns('chrome://gibberish_id/sidebar.html');
            var sidebarObj = sidebar.putInElement('#sandbox');
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
