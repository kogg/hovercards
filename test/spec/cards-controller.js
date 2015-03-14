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

        it('should not push the same card twice', function() {
            $scope.addCard({ content: 'something', id: 'ID' });
            $scope.addCard({ content: 'something', id: 'ID' });
            $scope.cards.should.deep.equal([{ content: 'something', id: 'ID' }]);
        });

        it('should be called a maximum of five times', function() {
            $scope.addCard({ content: 'something1', id: 'ID1' });
            $scope.addCard({ content: 'something2', id: 'ID2' });
            $scope.addCard({ content: 'something3', id: 'ID3' });
            $scope.addCard({ content: 'something4', id: 'ID4' });
            $scope.addCard({ content: 'something5', id: 'ID5' });
            $scope.addCard({ content: 'something6', id: 'ID6' });
            $scope.cards.should.deep.equal([{ content: 'something1', id: 'ID1' },
                                            { content: 'something2', id: 'ID2' },
                                            { content: 'something3', id: 'ID3' },
                                            { content: 'something4', id: 'ID4' },
                                            { content: 'something5', id: 'ID5' }]);
        });
    });
});
