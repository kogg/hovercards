'use strict';

define(['angular-app'], function(app) {
    app.directive('sidebar', function() {
        return {
            scope: { },
            templateUrl: 'templates/sidebar.html',
            link: function($scope) {
                $scope.cardsets = [];
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
                                $scope.cardsets = [$scope.deck];
                                $scope.deck = null;
                            });
                            break;
                    }
                });
            }
        };
    });
});
