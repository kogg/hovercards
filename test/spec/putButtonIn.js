/* global $, describe, it, afterEach */
/*jshint expr:true */
'use strict';

(function() {
    describe('putButtonIn', function() {
        describe('button', function() {
            it('should be in the element');
            it('should have position absolute');
            it('should have a left and top of 0');
        });

        afterEach(function() {
            $('sandbox').empty();
        });
    });
})();
