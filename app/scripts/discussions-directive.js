'use strict';

define('discussions-directive', ['angular-app', 'oboe'], function(app, oboe) {
    app.directive('discussions', function() {
        return {
            scope: {
                request: '=',
                discussions: '='
            },
            link: function($scope) {
                var aborts = [];
                $scope.$watch('request', function(request) {
                    $scope.discussions = null;
                    aborts.forEach(function(abort) {
                        abort();
                    });
                    aborts = [];
                    if (!request) {
                        return;
                    }
                    aborts.push(oboe('https://hovercards.herokuapp.com/v1/' + request.type + '/' + request.id + '/discussions')
                        .node('!.{type id}', function(discussion) {
                            $scope.$apply(function() {
                                $scope.discussions = $scope.discussions || [];
                                $scope.discussions.push(discussion);
                            });
                        })
                        .fail(function(jqXHR) {
                            $scope.$apply(function() {
                                $scope.discussions = { err: { code: jqXHR.statusCode, message: jqXHR.body } };
                            });
                        })
                        .abort);
                });
            }
        };
    });
});
