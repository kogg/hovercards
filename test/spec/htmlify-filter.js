'use strict';

describe('htmlify-filter', function() {
    var htmlify;

    beforeEach(function(done) {
        require(['htmlify-filter'], function() {
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function($filter) {
        htmlify = $filter('htmlify');
    }));

    it('should replace newlines with line breaks', function() {
        htmlify('Something\nSomething Else').should.equal('Something<br>Something Else');
    });

    it('should wrap urls with links', function() {
        htmlify('https://www.wenoknow.com').should.equal('<a target="_blank" href="https://www.wenoknow.com">https://www.wenoknow.com</a>');
    });
});
