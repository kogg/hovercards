'use strict';

describe('cards-directive', function() {
    var sandbox = sinon.sandbox.create();
    var angular;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['angular', 'cards-directive'], function(_angular) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            angular = _angular;
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('should set cards to an array', function() {
        var element = angular.element('<div cards></div>');

        $compile(element)($rootScope);
        $rootScope.$digest();

        var scope = element.isolateScope();
        $rootScope.$digest();

        expect(scope.cards).to.deep.equal([]);
    });
});
