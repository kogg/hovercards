'use strict';

define('account-directive', ['angular-app'], function(app) {
    app.directive('account', function() {
        return {
            scope: {
                request: '=',
                account: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    $scope.account = null;
                    clearTimeout(timeout);
                    if (!request) {
                        return;
                    }
                    $.get('https://hovercards.herokuapp.com/v1/account/' + request.type + '/' + request.id)
                        .done(function(data) {
                            $scope.$apply(function() {
                                $scope.account = data;
                            });
                        });
                });
            }
        };
    });
});
