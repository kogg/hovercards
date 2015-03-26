'use strict';

define(['angular-app'], function(app) {
    app.directive('sidebar', function() {
        return {
            scope: { },
            replace: true,
            templateUrl: 'templates/sidebar.html',
            link: function($scope) {
                chrome.runtime.onMessage.addListener(function(request) {
                    switch (request.msg) {
                        case 'deck':
                            $scope.$apply(function() {
                                $scope.deck = { content: request.content, id: request.id };
                            });
                            break;
                        case 'undeck':
                            if (!$scope.deck) {
                                return;
                            }
                            $scope.$apply(function() {
                                $scope.cardset = $scope.deck;
                                $scope.deck = null;
                            });
                            break;
                    }
                });
            }
        };
    });
});
