'use strict';

describe('content-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var scope;

    beforeEach(function(done) {
        require(['content-directive'], function() {
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
            element = angular.element('<div content="content" request="request"></div>');

            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should two way bind content', function() {
        $rootScope.content = 'Out => In';
        $rootScope.$digest();
        expect(scope.content).to.equal('Out => In');

        scope.content = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.content).to.equal('In => Out');
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
        it('should empty content', function() {
            $rootScope.request = 'Something';
            $rootScope.$digest();
            $rootScope.content = 'Something';
            $rootScope.$digest();
            $rootScope.request = 'Something Else';
            $rootScope.$digest();

            expect($rootScope.content).not.to.exist;
        });

        // TODO Load stuff from server
    });
});
