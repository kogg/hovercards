'use strict';

describe('layout-directive', function() {
    var sandbox = sinon.sandbox.create();
    var angular;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['angular', 'layout-directive'], function(_angular) {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            angular = _angular;
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $templateCache.put('templates/layout.html', '<div></div>');
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('should start with empty layouts', function() {
        var element = angular.element('<div layout></div>');
        var scope;

        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.layouts).to.deep.equal([]);
    });

    describe('on load', function() {
        it('should set layouts', function() {
            var element = angular.element('<div layout></div>');
            var scope;

            $compile(element)($rootScope);
            $rootScope.$digest();

            chrome.runtime.onMessage.addListener.yield({ msg: 'load', provider: 'somewhere', content: 'something', id: 'SOME_ID' });
            $rootScope.$digest();
            scope = element.isolateScope();

            expect(scope.layouts).to.deep.equal([{ provider: 'somewhere', content: 'something', id: 'SOME_ID' }]);
        });
    });

    describe('on hide', function() {
        it('should empty layouts', function() {
            var element = angular.element('<div layout></div>');
            var scope;

            $compile(element)($rootScope);
            $rootScope.$digest();

            scope = element.isolateScope();
            scope.layouts = [{ something: 'something' }];
            $rootScope.$digest();

            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            $rootScope.$digest();

            expect(scope.layouts).to.deep.equal([]);
        });
    });
});
