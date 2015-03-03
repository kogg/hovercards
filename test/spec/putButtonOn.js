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
            it('should have position absolute');
            it('should have an offset equal to the element');
        });

        afterEach(function() {
            $('sandbox').empty();
        });
    });
})();
