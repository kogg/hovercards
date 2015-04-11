'use strict';

describe('related-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var scope;

    beforeEach(function(done) {
        require(['related-directive'], function() {
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
            element = angular.element('<div related="related" request="request"></div>');

            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should two way bind related', function() {
        $rootScope.related = 'Out => In';
        $rootScope.$digest();
        expect(scope.related).to.equal('Out => In');

        scope.related = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.related).to.equal('In => Out');
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
        it('should empty related if request is empty', function() {
            $rootScope.request = 'Something';
            $rootScope.$digest();
            $rootScope.related = 'Something';
            $rootScope.$digest();
            $rootScope.request = null;
            $rootScope.$digest();

            expect($rootScope.related).not.to.exist;
        });

        // TODO Load stuff from server
    });
});
