'use strict';

define(['angular-app'], function(app) {
    app.controller('CardsController', ['$scope', '$filter', function($scope, $filter) {
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
                    request.cards[i].description = $filter('linky')(request.cards[i].description, '_blank').replace(/(&#10;|\n)/g, '<br>');
                }
                $scope.cards = request.cards;
            });
        });
    }]);
});
