'use strict';

define('discussions-directive', ['angular-app', 'jquery'], function(app, $) {
    app.directive('discussions', function() {
        return {
            scope: {
                requests: '=',
                discussions: '=',
                selectedIndex: '='
            },
            link: function($scope) {
                var aborts = [];
                $scope.$watch('requests', function(requests) {
                    $scope.selectedIndex = -1;
                    $scope.discussions = null;
                    aborts.forEach(function(abort) {
                        abort();
                    });
                    aborts = [];
                    if (!requests) {
                        return;
                    }
                    $scope.selectedIndex = 0;
                    $scope.discussions = [];
                    /*
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
                        */
                });
                $scope.$watch('selectedIndex', function(selectedIndex, old) {
                    if (selectedIndex === -1 || selectedIndex === old || !$scope.requests) {
                        return;
                    }
                    if ($scope.discussions[selectedIndex]) {
                        return;
                    }
                    var request = $scope.requests[selectedIndex];
                    $.get('https://hovercards.herokuapp.com/v1/' + request.type + '/' + request.id)
                        .done(function(data) {
                            $scope.$apply(function() {
                                $scope.discussions[selectedIndex] = data;
                            });
                        });
                });
            }
        };
    });
});
