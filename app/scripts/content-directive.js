'use strict';

define('content-directive', ['angular-app'], function(app) {
    app.directive('content', function() {
        return {
            scope: {
                request: '=',
                content: '='
            },
            link: function($scope) {
                $scope.$watch('request', function(request) {
                    $scope.content = null;
                    if (!request) {
                        return;
                    }
                    $.get('https://hovercards.herokuapp.com/v1/content/' + request.type + '/' + request.id)
                        .done(function(data) {
                            $scope.$apply(function() {
                                $scope.content = data;
                            });
                        });
                });
            }
        };
    });
});
