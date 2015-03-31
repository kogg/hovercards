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
                        $('html,body').scrollTop(0);
                        $scope.cardsets = [{ provider: request.provider, content: request.content, id: request.id }];
                    });
                });
            }
        };
    });
});
