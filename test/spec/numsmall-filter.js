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

    it('should leave 0 <= x < 10000 alone', function() {
        for (var i = 0; i < 10000; i++) {
            numsmall(i).should.equal(i + '');
        }
    });

    it('should make 10000 <= x < 1000000 use 1k <= x < 1000k notation', function() {
        numsmall(10000).should.equal('10k');
        numsmall(10599).should.equal('10k');
        numsmall(100599).should.equal('100k');
        numsmall(999999).should.equal('999k');
    });

    it('should make 1000000 <= x < 1000000000 use 1m <= x < 1000m notation', function() {
        numsmall(1000000).should.equal('1.00m');
        numsmall(1599999).should.equal('1.59m');
        numsmall(10599999).should.equal('10.59m');
        numsmall(100599999).should.equal('100.59m');
        numsmall(999999999).should.equal('999.99m');
    });

    it('should make 1000000000 <= x < 1000000000000 use 1b <= x < 1000b notation', function() {
        numsmall(1000000000).should.equal('1.00b');
        numsmall(1599999999).should.equal('1.59b');
        numsmall(10599999999).should.equal('10.59b');
        numsmall(100599999999).should.equal('100.59b');
        numsmall(999999999999).should.equal('999.99b');
    });
});
