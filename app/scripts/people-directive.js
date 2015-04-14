'use strict';

define('people-directive', ['angular-app', 'oboe', 'jquery'], function(app, oboe, $) {
    app.directive('people', function() {
        return {
            scope: {
                request: '=',
                people: '=',
                selectedPerson: '='
            },
            link: function($scope) {
                $scope.$watch('request', function(request) {
                    $scope.selectedPerson = null;
                    $scope.people = null;
                    if (!request) {
                        return;
                    }
                    var people = [];
                    $scope.people = people;
                    oboe('https://hovercards.herokuapp.com/v1/accounts?' + decodeURIComponent($.param({ accounts: request })))
                        .node('!.{type id}', function(account) {
                            $scope.$apply(function() {
                                var person = { accounts: [account], selectedAccount: account };
                                people.push(person);
                                $scope.selectedPerson = $scope.selectedPerson || person;
                            });
                        });
                });
            }
        };
    });
});
