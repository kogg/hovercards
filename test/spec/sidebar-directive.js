'use strict';

describe('sidebar-directive', function() {
    var sandbox = sinon.sandbox.create();
    var angular;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['angular', 'sidebar-directive'], function(_angular) {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            angular = _angular;
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $templateCache.put('templates/sidebar.html', '<div></div>');
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('should not start with a cardset', function() {
        var element = angular.element('<div sidebar></div>');
        var scope;

        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.cardset).to.be.undefined;
    });

    it('should not start with a deck', function() {
        var element = angular.element('<div sidebar></div>');
        var scope;

        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.deck).to.be.undefined;
    });

    it('should ng-include content if cardset is set', function() {
        var element = angular.element('<div sidebar></div>');
        var scope;

        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        scope.cardset = { content: 'something', id: 'SOME_ID' };
        $rootScope.$digest();
        scope.cardset.should.deep.equal({ content: 'something', id: 'SOME_ID' });
    });

    describe('on deck', function() {
        it('should set deck', function() {
            var element = angular.element('<div sidebar></div>');
            var scope;

            $compile(element)($rootScope);
            $rootScope.$digest();

            chrome.runtime.onMessage.addListener.yield({ msg: 'deck', content: 'something', id: 'SOME_ID' });
            $rootScope.$digest();
            scope = element.isolateScope();

            scope.deck.should.deep.equal({ content: 'something', id: 'SOME_ID' });
        });
    });

    describe('on undeck', function() {
        it('should set cardset to deck', function() {
            var element = angular.element('<div sidebar></div>');
            var scope;

            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();

            scope.deck = { content: 'something', id: 'SOME_ID' };
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
            $rootScope.$digest();

            scope.cardset.should.deep.equal({ content: 'something', id: 'SOME_ID' });
        });

        it('should unset deck', function() {
            var element = angular.element('<div sidebar></div>');
            var scope;

            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();

            scope.deck = { content: 'something', id: 'SOME_ID' };
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
            $rootScope.$digest();

            expect(scope.deck).to.be.null;
        });

        it('should not unset cardset if called twice more', function() {
            var element = angular.element('<div sidebar></div>');
            var scope;

            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();

            scope.cardset = { content: 'something', id: 'SOME_ID' };
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
            $rootScope.$digest();
            chrome.runtime.onMessage.addListener.yield({ msg: 'undeck' });
            $rootScope.$digest();

            scope.cardset.should.deep.equal({ content: 'something', id: 'SOME_ID' });
        });
    });
});
