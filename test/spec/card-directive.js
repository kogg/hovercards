'use strict';

describe('card-directive', function() {
    var sandbox = sinon.sandbox.create();
    var angular;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['angular', 'card-directive'], function(_angular) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            angular = _angular;
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $templateCache.put('templates/card.html', '<div></div>');
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('should set scopes', function() {
        var element = angular.element('<div card provider="somewhere" content="something" id="id" object="object"></div>');

        $compile(element)($rootScope);
        $rootScope.$digest();

        var scope = element.isolateScope();
        scope.id = 'SOME_ID';
        scope.object = { some: 'attribute' };
        $rootScope.$digest();

        expect(scope.provider).to.equal('somewhere');
        expect(scope.content).to.equal('something');
        expect($rootScope.id).to.equal('SOME_ID');
        expect($rootScope.object).to.deep.equal({ some: 'attribute' });
    });
});
