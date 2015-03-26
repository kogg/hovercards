'use strict';

define(['angular-app'], function(app) {
    return app.directive('sidebar', function() {
        return {
            scope: { },
            templateUrl: 'templates/sidebar.html',
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
