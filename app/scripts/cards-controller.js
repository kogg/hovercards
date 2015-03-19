'use strict';

define(['angular-app'], function(app) {
    app.controller('CardsController', ['$scope', function($scope) {
        $scope.currentId = null;
        chrome.runtime.onMessage.addListener(function(request) {
            if (request.msg !== 'cards' && request.msg !== 'card') {
                return;
            }
            $scope.$apply(function() {
                switch (request.msg) {
                    case 'cards':
                        $scope.currentId = request.id;
                        $scope.cardGroups = [[]];
                        break;
                    case 'card':
                        if (request.id !== $scope.currentId) {
                            return;
                        }
                        $scope.cardGroups[0].push(request.card);
                        break;
                }
            });
        });
    }]);
});
