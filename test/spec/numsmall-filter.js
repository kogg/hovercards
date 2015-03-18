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

    it('should leave 0 <= x < 1000 alone', function() {
        numsmall(0).should.equal('0');
        numsmall(1).should.equal('1');
        numsmall(2).should.equal('2');
        numsmall(3).should.equal('3');
        numsmall(4).should.equal('4');
        numsmall(5).should.equal('5');
        numsmall(6).should.equal('6');
        numsmall(7).should.equal('7');
        numsmall(8).should.equal('8');
        numsmall(9).should.equal('9');
    });

    it('should make 1000 <= x < 1000000 use 1k <= x < 1000k notation', function() {
        numsmall(1599).should.equal('1k');
        numsmall(10599).should.equal('10k');
        numsmall(100599).should.equal('100k');
        numsmall(999999).should.equal('999k');
    });

    it('should make 1000000 <= x < 1000000000 use 1m <= x < 1000m notation', function() {
        numsmall(1599999).should.equal('1m');
        numsmall(10599999).should.equal('10m');
        numsmall(100599999).should.equal('100m');
        numsmall(999999999).should.equal('999m');
    });

    it('should make 1000000000 <= x < 1000000000000 use 1b <= x < 1000b notation', function() {
        numsmall(1599999999).should.equal('1b');
        numsmall(10599999999).should.equal('10b');
        numsmall(100599999999).should.equal('100b');
        numsmall(999999999999).should.equal('999b');
    });
});
