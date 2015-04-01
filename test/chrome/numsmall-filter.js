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
            expect(numsmall(i)).to.equal(i + '');
        }
    });

    it('should make 10000 <= x < 1000000 use 1k <= x < 1000k notation', function() {
        expect(numsmall(10000)).to.equal('10k');
        expect(numsmall(10599)).to.equal('10k');
        expect(numsmall(100599)).to.equal('100k');
        expect(numsmall(999999)).to.equal('999k');
    });

    it('should make 1000000 <= x < 1000000000 use 1m <= x < 1000m notation', function() {
        expect(numsmall(1000000)).to.equal('1.00m');
        expect(numsmall(1599999)).to.equal('1.59m');
        expect(numsmall(10599999)).to.equal('10.59m');
        expect(numsmall(100599999)).to.equal('100.59m');
        expect(numsmall(999999999)).to.equal('999.99m');
    });

    it('should make 1000000000 <= x < 1000000000000 use 1b <= x < 1000b notation', function() {
        expect(numsmall(1000000000)).to.equal('1.00b');
        expect(numsmall(1599999999)).to.equal('1.59b');
        expect(numsmall(10599999999)).to.equal('10.59b');
        expect(numsmall(100599999999)).to.equal('100.59b');
        expect(numsmall(999999999999)).to.equal('999.99b');
    });
});
