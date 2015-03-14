'use strict';

define(['angular-app'], function(app) {
    app.controller('CardsController', ['$scope', function($scope) {
        function addCard(card) {
            for (var i = 0; i < $scope.cards.length; i++) {
                if ($scope.cards[i].content === card.content && $scope.cards[i].id === card.id) {
                    return;
                }
            }
            $scope.cards.push(card);
        }

        $scope.addCard = addCard;
        $scope.cards = [];
    }]);
});
