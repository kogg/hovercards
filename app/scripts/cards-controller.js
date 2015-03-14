'use strict';

define(['angular-app'], function(app) {
    app.controller('CardsController', ['$scope', function($scope) {
        function addCard(card) {
            $scope.cards.push(card);
        }

        $scope.addCard = addCard;
        $scope.cards = [];
    }]);
});
