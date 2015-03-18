'use strict';

describe('cards-controller', function() {
    var sandbox = sinon.sandbox.create();
    var controller;
    var $scope;

    beforeEach(function(done) {
        require(['cards-controller'], function() {
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function($controller, $rootScope) {
        sandbox.stub(chrome.runtime.onMessage, 'addListener');
        $scope = $rootScope.$new();
        controller = $controller('CardsController', { $scope: $scope });
    }));

    afterEach(function() {
        sandbox.restore();
    });

    describe('when receiving card message', function() {
        it('should put the card onto $scope.cards', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'first', priority: 0, card: { content: 'something' } }, { tab: { id: 'TAB_ID' } });
            $scope.cards.should.deep.equal([{ content: 'something' }]);
        });

        it('should push following cards onto $scope.cards', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'first', priority: 0, card: { content: 'something' } }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'first', priority: 0, card: { content: 'something-else' } }, { tab: { id: 'TAB_ID' } });
            $scope.cards.should.deep.equal([{ content: 'something' }, { content: 'something-else' }]);
        });

        it('should reset $scope.cards on new id', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'first', priority: 0, card: { content: 'something' } }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'second', priority: 0, card: { content: 'something-else' } }, { tab: { id: 'TAB_ID' } });
            $scope.cards.should.deep.equal([{ content: 'something-else' }]);
        });

        it('should not reset $scope.cards on old id', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'first', priority: 0, card: { content: 'something' } }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'second', priority: 0, card: { content: 'something-else' } }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'first', priority: 0, card: { content: 'something-fresh' } }, { tab: { id: 'TAB_ID' } });
            $scope.cards.should.deep.equal([{ content: 'something-else' }]);
        });
    });

    /*
    describe('when receiving cards message', function() {
        it('should set $scope.cards', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'cards', cards: [{ content: 'something' }] }, { tab: { id: 'TAB_ID' } });
            $scope.cards.should.deep.equal([{ content: 'something' }]);
        });
    });
    */
});
