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

    describe('when receiving cards message', function() {
        it('should reset $scope.cardGroups', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'cards', id: 'first' }, { tab: { id: 'TAB_ID' } });
            $scope.cardGroups = [[{ content: 'something' }]];
            chrome.runtime.onMessage.addListener.yield({ msg: 'cards', id: 'second' }, { tab: { id: 'TAB_ID' } });
            $scope.cardGroups.should.deep.equal([[]]);
        });
    });

    describe('when receiving card message', function() {
        it('should not push cards until cards message', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'first', priority: 0, card: { content: 'something' } }, { tab: { id: 'TAB_ID' } });
            expect($scope.cardGroups).not.to.exist;
        });

        it('should push card  after cards message', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'cards', id: 'first' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'first', priority: 0, card: { content: 'something' } }, { tab: { id: 'TAB_ID' } });
            $scope.cardGroups.should.deep.equal([[{ content: 'something' }]]);
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'first', priority: 1, card: { content: 'something-else' } }, { tab: { id: 'TAB_ID' } });
            $scope.cardGroups.should.deep.equal([[{ content: 'something' }, { content: 'something-else' }]]);
        });

        it('should not push card onto $scope.cards if wrong id', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'cards', id: 'first' }, { tab: { id: 'TAB_ID' } });
            chrome.runtime.onMessage.addListener.yield({ msg: 'card', id: 'second', priority: 0, card: { content: 'something' } }, { tab: { id: 'TAB_ID' } });
            $scope.cardGroups.should.deep.equal([[]]);
        });
    });
});
