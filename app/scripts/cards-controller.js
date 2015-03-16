'use strict';

define(['angular-app'], function(app) {
    app.controller('CardsController', ['$scope', function($scope) {
        $scope.cards = [];
        chrome.runtime.onMessage.addListener(function(request) {
            if (request.msg !== 'cards') {
                return;
            }
            $scope.$apply(function() {
                $scope.cards = request.cards;
            });
        });
    }]);
});
