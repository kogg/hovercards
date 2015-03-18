'use strict';

define(['angular-app'], function(app) {
    app.controller('CardsController', ['$scope', function($scope) {
        $scope.cards = [];
        chrome.runtime.onMessage.addListener(function(request) {
            if (request.msg !== 'cards') {
                return;
            }
            $scope.$apply(function() {
                for (var i = 0; i < request.cards.length; i++) {
                    if (!request.cards[i].description) {
                        continue;
                    }
                }
                $scope.cards = request.cards;
            });
        });
    }]);
});
