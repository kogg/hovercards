'use strict';

define(['angular-app'], function(app) {
    app.controller('CardsController', ['$scope', function($scope) {
        $scope.ids = {};
        $scope.currentId = null;
        chrome.runtime.onMessage.addListener(function(request) {
            if (request.msg !== 'card') {
                return;
            }
            $scope.$apply(function() {
                if (!$scope.currentId || !$scope.ids[request.id]) {
                    $scope.ids[request.id] = true;
                    $scope.currentId = request.id;
                    $scope.cards = [];
                }
                if ($scope.currentId !== request.id) {
                    return;
                }
                $scope.cards.push(request.card);
            });
        });
    }]);
});
