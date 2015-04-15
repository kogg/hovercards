'use strict';

define('people-directive', ['angular-app', 'oboe'], function(app, oboe) {
    app.directive('people', function() {
        return {
            scope: {
                requests: '=',
                people: '=',
                selectedPerson: '='
            },
            link: function($scope) {
                var aborts = [];
                $scope.$watch('requests', function(requests) {
                    $scope.selectedPerson = null;
                    $scope.people = null;
                    aborts.forEach(function(abort) {
                        abort();
                    });
                    aborts = [];
                    if (!requests) {
                        return;
                    }
                    var people = [];
                    $scope.people = people;
                    requests.forEach(function(request) {
                        aborts.push(oboe('https://hovercards.herokuapp.com/v1/accounts/' + request.type + '/' + request.id)
                            .node('!.{type id}', function(account) {
                                $scope.$apply(function() {
                                    var person = { accounts: [account], selectedAccount: account };
                                    people.push(person);
                                    $scope.selectedPerson = $scope.selectedPerson || person;
                                });
                            })
                            .abort);
                    });
                });
            }
        };
    });
});
