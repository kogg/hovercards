'use strict';

describe('sidebar-directive', function() {
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['sidebar-directive'], function() {
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should have a test', function() {
    });
});
