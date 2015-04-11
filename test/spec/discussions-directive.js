'use strict';

describe('discussions-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var scope;

    beforeEach(function(done) {
        require(['discussions-directive'], function() {
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));
    beforeEach(function(done) {
        require(['angular'], function(angular) {
            element = angular.element('<div discussions="discussions" request="request"></div>');

            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should two way bind discussions', function() {
        $rootScope.discussions = 'Out => In';
        $rootScope.$digest();
        expect(scope.discussions).to.equal('Out => In');

        scope.discussions = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.discussions).to.equal('In => Out');
    });

    it('should two way bind request', function() {
        $rootScope.request = 'Out => In';
        $rootScope.$digest();
        expect(scope.request).to.equal('Out => In');

        scope.request = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.request).to.equal('In => Out');
    });

    describe('on request', function() {
        it('should empty discussions if request is empty', function() {
            $rootScope.request = 'Something';
            $rootScope.$digest();
            $rootScope.discussions = 'Something';
            $rootScope.$digest();
            $rootScope.request = null;
            $rootScope.$digest();

            expect($rootScope.discussions).not.to.exist;
        });

        // TODO Load stuff from server
    });
});
