/* global $, describe, it, afterEach */
/*jshint expr:true */
'use strict';

(function() {
    describe('putButtonOn', function() {
        describe('embed', function() {
            it('should be before https embeds');
            it('should be before http embeds');
            it('should be before relative protocol embeds');
        });

        describe('object', function() {
            it('should be before https objects');
            it('should be before http objects');
            it('should be before relative protocol objects');
        });

        describe('button', function() {
            it('should be at the same position as the element');
            it('should follow the element when the window resizes');
        });

        afterEach(function() {
            $('#sandbox').empty();
        });
    });
})();
