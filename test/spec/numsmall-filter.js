'use strict';

describe('numsmall-filter', function() {
    var numsmall;

    beforeEach(function(done) {
        require(['numsmall-filter'], function() {
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function($filter) {
        numsmall = $filter('numsmall');
    }));

    it('should leave 0 < x< 1000 alone', function() {
        for (var i = 0; i < 10; i++) {
            numsmall(i).should.equal(i);
        }
    });
});
