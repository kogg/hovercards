'use strict';

define(['angular-app'], function(app) {
    return app.directive('cardset', function() {
        return {
            scope: { },
            templateUrl: 'templates/cardset.html',
            link: function($scope) {
                $scope.cardsets = [];
                chrome.runtime.onMessage.addListener(function(request) {
                    if (request.msg !== 'load') {
                        return;
                    }
                    $scope.$apply(function() {
                        $scope.cardsets = [{ content: request.content, id: request.id }];
                    });
                });
            }
        };
    });
});
