'use strict';

define(['angular-app'], function(app) {
    return app.directive('layout', function() {
        return {
            scope: { },
            templateUrl: 'templates/layout.html',
            link: function($scope) {
                $scope.layouts = [];
                chrome.runtime.onMessage.addListener(function(request) {
                    if (request.msg !== 'load') {
                        return;
                    }
                    $scope.$apply(function() {
                        $scope.layouts = [{ provider: request.provider, content: request.content, id: request.id }];
                    });
                });
            }
        };
    });
});
