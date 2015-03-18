'use strict';

define(['angular-app'], function(app) {
    app.controller('CardsController', ['$scope', function($scope) {
        $scope.cards = [];
        $scope.currentId = null;
        chrome.runtime.onMessage.addListener(function(request) {
            if (request.msg !== 'cards' && request.msg !== 'card') {
                return;
            }
            $scope.$apply(function() {
                switch (request.msg) {
                    case 'cards':
                        $scope.currentId = request.id;
                        $scope.cards = [];
                        break;
                    case 'card':
                        if (request.id !== $scope.currentId) {
                            return;
                        }
                        $scope.cards.push(request.card);
                        break;
                }
            });
        });
    }]);
});
