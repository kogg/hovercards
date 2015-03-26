'use strict';

describe('sidebar-directive', function() {
    var angular;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['angular', 'sidebar-directive'], function(_angular) {
            angular = _angular;
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should not start with a cardset', function() {
        var element = angular.element('<div sidebar></div>');
        $compile(element)($rootScope);
        $rootScope.$digest();
        var scope = element.isolateScope();
        expect(scope.cardset).to.be.undefined;
    });
});
