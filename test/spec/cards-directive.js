'use strict';

describe('cards-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['cards-directive'], function() {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
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
            element = angular.element('<div cards></div>');

            $compile(element)($rootScope);
            $rootScope.$digest();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should set cards to an array', function() {
        var scope = element.isolateScope();
        expect(scope.cards).to.deep.equal([]);
    });

    describe('on hide', function() {
        it('should empty cards', function() {
            var scope = element.isolateScope();

            scope.cards = [{ provider: 'somewhere', content: 'something' }];

            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            $rootScope.$digest();

            expect(scope.cards).to.deep.equal([]);
        });
    });
});
