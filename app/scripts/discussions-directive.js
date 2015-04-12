'use strict';

define('discussions-directive', ['angular-app'], function(app) {
    app.directive('discussions', function() {
        return {
            scope: {
                request: '=',
                discussions: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    $scope.discussions = null;
                    clearTimeout(timeout);
                    if (!request) {
                        return;
                    }
                    $.get('https://hovercards.herokuapp.com/v1/discussions/' + request.type + '/' + request.id)
                        .done(function(data) {
                            $scope.$apply(function() {
                                $scope.discussions = data;
                            });
                        });
                });
            }
        };
    });
});
