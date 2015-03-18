'use strict';

describe('numsmall-filter', function() {
    var description;

    beforeEach(function(done) {
        require(['description-filter'], function() {
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function($filter) {
        description = $filter('description');
    }));

    it('should replace newlines with line breaks', function() {
        description('Something\nSomething Else').should.equal('Something<br>Something Else');
    });

    it('should wrap urls with links', function() {
        description('https://www.wenoknow.com').should.equal('<a target="_blank" href="https://www.wenoknow.com">https://www.wenoknow.com</a>');
    });
});
