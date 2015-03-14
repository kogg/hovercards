'use strict';

describe('cards-controller', function() {
    var controller;
    var $scope;

    beforeEach(function(done) {
        require(['cards-controller'], function() {
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function($controller, $rootScope) {
        $scope = $rootScope.$new();
        controller = $controller('CardsController', { $scope: $scope });
    }));

    describe('#addCard', function() {
        it('should push the card onto #cards', function() {
            $scope.addCard({ content: 'something', id: 'ID' });
            $scope.cards.should.deep.equal([{ content: 'something', id: 'ID' }]);
        });

        it('shouldn\'t push the same card twice', function() {
            $scope.addCard({ content: 'something', id: 'ID' });
            $scope.addCard({ content: 'something', id: 'ID' });
            $scope.cards.should.deep.equal([{ content: 'something', id: 'ID' }]);
        });
    });
});
