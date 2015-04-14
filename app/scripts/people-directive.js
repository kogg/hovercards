'use strict';

define('people-directive', ['angular-app'], function(app) {
    app.directive('people', function() {
        return {
            scope: {
                request: '=',
                people: '=',
                selectedPerson: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    $scope.people = null;
                    clearTimeout(timeout);
                    if (!request) {
                        return;
                    }
                    $scope.people = [];
                    $.get('https://hovercards.herokuapp.com/v1/accounts', { accounts: request })
                        .done(function(accounts) {
                            $scope.$apply(function() {
                                accounts.forEach(function(account) {
                                    $scope.people.push({ accounts: [account], selectedAccount: account });
                                });
                                $scope.selectedPerson = $scope.people[0];
                            });
                        });
                });
            }
        };
    });
});
