'use strict';

define('people-directive', ['angular-app'], function(app) {
    app.directive('people', function() {
        return {
            scope: {
                request: '=',
                people: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    $scope.people = null;
                    clearTimeout(timeout);
                    if (!request) {
                        return;
                    }
                    $.get('https://hovercards.herokuapp.com/v1/accounts', { accounts: request })
                        .done(function(accounts) {
                            $scope.$apply(function() {
                                $scope.people = [{ accounts: accounts, selectedAccount: accounts[0] }];
                            });
                        });
                });
            }
        };
    });
});
