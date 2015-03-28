'use strict';

describe('cardset-directive', function() {
    var sandbox = sinon.sandbox.create();
    var angular;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['angular', 'cardset-directive'], function(_angular) {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            angular = _angular;
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $templateCache.put('templates/cardset.html', '<div></div>');
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('should start with empty cardsets', function() {
        var element = angular.element('<div cardset></div>');
        var scope;

        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.cardsets).to.deep.equal([]);
    });

    describe('on load', function() {
        it('should set cardsets on load', function() {
            var element = angular.element('<div cardset></div>');
            var scope;

            $compile(element)($rootScope);
            $rootScope.$digest();

            chrome.runtime.onMessage.addListener.yield({ msg: 'load', content: 'something', id: 'SOME_ID' });
            $rootScope.$digest();
            scope = element.isolateScope();

            expect(scope.cardsets).to.deep.equal([{ content: 'something', id: 'SOME_ID' }]);
        });
    });
});
