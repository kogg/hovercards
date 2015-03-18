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
    });
});
