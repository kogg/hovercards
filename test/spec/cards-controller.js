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
        it('should set $scope.cards', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'cards', cards: [{ content: 'something' }] }, { tab: { id: 'TAB_ID' } });
            $scope.cards.should.deep.equal([{ content: 'something' }]);
        });

        it('should replace newlines with line breaks in description', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'cards', cards: [{ description: 'Something\nSomething Else' }] }, { tab: { id: 'TAB_ID' } });
            $scope.cards.should.deep.equal([{ description: 'Something<br>Something Else' }]);
        });

        it('should wrap urls with links in description', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'cards', cards: [{ description: 'https://www.wenoknow.com' }] }, { tab: { id: 'TAB_ID' } });
            $scope.cards.should.deep.equal([{ description: '<a target="_blank" href="https://www.wenoknow.com">https://www.wenoknow.com</a>' }]);
        });
    });
});
